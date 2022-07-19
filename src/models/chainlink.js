const { ethers } = require("ethers"); // for nodejs only
ethers;
const config = require("config");
const provider = new ethers.providers.JsonRpcProvider(
  config.get("ETH_PROVIDER")
);
const _ = require("lodash");
const debug = require("debug");
const moment = require("moment");
const { sequelize } = require("../lib/database");
const AppError = require("../utils/AppError");

const aggregatorV3InterfaceABI = [
  {
    inputs: [],
    name: "decimals",
    outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "description",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint80", name: "_roundId", type: "uint80" }],
    name: "getRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "latestRoundData",
    outputs: [
      { internalType: "uint80", name: "roundId", type: "uint80" },
      { internalType: "int256", name: "answer", type: "int256" },
      { internalType: "uint256", name: "startedAt", type: "uint256" },
      { internalType: "uint256", name: "updatedAt", type: "uint256" },
      { internalType: "uint80", name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "version",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

exports.getDataFeed = async (from, to, blockchain) => {
  let dataFeed = await sequelize.models.data_feed.findOne({
    where: {
      from,
      to,
      provider: "chainlink",
      blockchain,
    },
  });
  if (!dataFeed) {
    const address = await provider.resolveName(
      `${_.lowerCase(from)}-${_.lowerCase(to)}.data.eth`
    );
    if (!address) throw new AppError(-10001);
    dataFeed = await sequelize.models.data_feed.create({
      from: _.upperCase(from),
      to: _.upperCase(to),
      provider: "chainlink",
      blockchain,
      address,
    });
  }

  return dataFeed;
};

exports.updatedDataFeed = async (address, from, to) => {
  const priceFeed = new ethers.Contract(
    address,
    aggregatorV3InterfaceABI,
    provider
  );
  const lastRoundData = await priceFeed.latestRoundData();
  const decimals = await priceFeed.decimals();
  const answer = ethers.utils.formatUnits(lastRoundData.answer, decimals);

  const dataObj = {
    from,
    to,
    timestamp: moment.unix(lastRoundData.startedAt.toNumber()).toISOString(),
    rate: answer,
    ...parseRoundId(lastRoundData.roundId),
  };
  await sequelize.models.exchange_rate.findOrCreate({
    where: dataObj,
    defaults: dataObj,
  });

  return {
    answer,
    timestamp: moment.unix(lastRoundData.startedAt.toNumber()).toISOString(),
  };
};

exports.getPriceFeed = async (from, to, blockchain = "ethereum") => {
  const dataFeed = await this.getDataFeed(from, to, blockchain);
  const result = await this.updatedDataFeed(dataFeed.address, from, to);
  return {
    rate: result.answer,
    timestamp: result.timestamp,
  };
};

exports.getTargetPriceFeed = async ({
  from,
  to,
  given_time,
  blockchain = "ethereum",
  round_id = null,
}) => {
  const dataFeed = await this.getDataFeed(from, to, blockchain);

  const priceFeed = new ethers.Contract(
    dataFeed.address,
    aggregatorV3InterfaceABI,
    provider
  );
  const decimals = await priceFeed.decimals();


  let recentRoundData;
  if (round_id) {
    recentRoundData = await priceFeed.getRoundData(
      ethers.BigNumber.from(BigInt(round_id))
    );
  } else {
    recentRoundData = await priceFeed.latestRoundData();
  }

  const recentRoundTime = recentRoundData.startedAt.toNumber();

  let result = {
    roundId: recentRoundData.roundId,
    timestamp: recentRoundTime,
    answer: ethers.utils.formatUnits(recentRoundData.answer, decimals)
  };
  if (given_time < recentRoundTime) {
    console.log("Start Searching...");
    targets = await this.getPrevPriceFeedRecursive(
      {
        priceFeed,
        from,
        to,
        decimals,
        prev_round_id: recentRoundData.roundId.sub(1),
        given_time,
      },
      (_result) => {
        result = _result
        console.log("Search Finished >> ", result);
      }
    );
  }

  const dataObj = {
    from,
    to,
    timestamp: moment.unix(result.timestamp).toISOString(),
    rate: result.answer,
    ...parseRoundId(result.roundId),
  };

  await sequelize.models.exchange_rate.findOrCreate({
    where: dataObj,
    defaults: dataObj,
  });

  return {
    rate: result.answer,
    timestamp: moment.unix(result.timestamp).toISOString(),
  };
};

exports.getPrevPriceFeedRecursive = async (_data, callback = () => { }) => {
  const { priceFeed, from, to, prev_round_id, given_time, decimals } = _data;

  const cacheData = await sequelize.models.exchange_rate.findOne({
    where: {
      from,
      to,
      ...parseRoundId(prev_round_id),
    },
  });
  let _prevRoundId;
  let _prevRoundTime;
  let _prevAnswer;
  // found from db
  if (cacheData) {
    _prevRoundId = this.getRoundId(
      cacheData.phase_id,
      cacheData.aggregator_round_id
    );
    _prevRoundTime = moment(cacheData.timestamp).unix();
    _prevAnswer = cacheData.rate;
  } else {
    const prevRoundData = await priceFeed.getRoundData(prev_round_id);
    _prevRoundId = prevRoundData.roundId;
    _prevRoundTime = prevRoundData.startedAt.toNumber();
    _prevAnswer = ethers.utils.formatUnits(prevRoundData.answer, decimals);
  }

  // recursive
  if (given_time < _prevRoundTime) {
    console.log(
      "recursive searching",
      moment.unix(_prevRoundTime).toISOString(),
      _prevRoundTime
    );

    // cache data
    if (!cacheData) {
      await sequelize.models.exchange_rate.create({
        from,
        to,
        timestamp: moment.unix(_prevRoundTime).toISOString(),
        rate: _prevAnswer,
        ...parseRoundId(_prevRoundId),
      });
    }

    await this.getPrevPriceFeedRecursive(
      {
        ..._data,
        prev_round_id: _prevRoundId.sub(1),
      },
      callback
    );
    return;
  }

  // hit the data and return result
  callback({
    roundId: _prevRoundId,
    answer: _prevAnswer,
    timestamp: _prevRoundTime,
  });
};

const parseRoundId = (roundId) => {
  const phase_id = Number(roundId.toBigInt() >> 64n);
  const max = BigInt("0xFFFFFFFFFFFFFFFF"); // Largest 64bits integer
  const aggregator_round_id = Number(roundId.toBigInt() & max);
  return {
    phase_id,
    aggregator_round_id,
  };
};

exports.getRoundId = (_phaseId, _aggregatorRoundId) => {
  const phaseId = BigInt(_phaseId);
  const aggregatorRoundId = BigInt(_aggregatorRoundId);

  return ethers.BigNumber.from((phaseId << 64n) | aggregatorRoundId);
};
