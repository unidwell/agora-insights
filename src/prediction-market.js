import assert from 'assert'
import { forEach, flatten } from 'lodash-es'

export default class PredictionMarket {
  constructor() {
    this.market = {}
  }

  createEvent(eventName) {
    this.market[eventName] = {
      outcomes: new Set(),
      participants: new Set(),
      pools: {},
      poolsTotal: {},
      total: 0,
    }
  }

  // addOutcomes(eventName, outcomes)
  // @param {string} eventName - the name of the event.
  // @param {Array<string>} outcomes - an array of outcome names.
  // This method adds the outcomes to the event.
  addOutcomes(eventName, outcomes) {
    assert.ok(
      typeof eventName === 'string',
      new Error(`Event name '${eventName}' must be a string.`)
    )
    assert.ok(
      this.market[eventName] !== undefined,
      new Error(`Event '${eventName}' does not exist.`)
    )
    assert.ok(Array.isArray(outcomes), new Error(`outcomes must be an array.`))

    outcomes.forEach((outcome) => {
      this.market[eventName].outcomes.add(outcome)
    })
  }

  // Add a bet to the specified pool.
  placeBet(eventName, outcomeName, participant, amount) {
    const market = this.market[eventName]
    assert.ok(market !== undefined, new Error(`Event '${eventName}' does not exist.`))
    assert.ok(
      market.outcomes.has(outcomeName) !== undefined,
      new Error(`Outcome '${outcomeName}' does not exist for event '${eventName}'.`)
    )
    assert.ok(
      typeof participant === 'string',
      new Error(`Participant '${participant}' must be a string.`)
    )
    assert.ok(typeof amount === 'number', new Error(`Amount '${amount}' must be a number.`))

    market.participants.add(participant)

    if (!market.pools[outcomeName]) {
      market.pools[outcomeName] = []
    }

    const bets = market.pools[outcomeName]
    bets.push([participant, amount])
  }

  // resolveMarket(eventName, winningOutcomeName)
  // @param {string} eventName - the name of the event.
  // @param {string} winningOutcomeName - the name of the winning outcome.
  //
  // Calculate the rewards for the participants that bet on the winning outcome.
  // It returns an object with the following properties:
  // - rewards: an object where the keys are the participants and the values are the amount of money they won.
  // - totalAmount: the total amount of money bet on the event by all participants.
  //
  // The rewards are calculated as follows:
  // - The participants that bet on the winning outcome keep the amount they bet.
  // - The rest of the money is distributed among the winners proportionally to the amount of money they bet.
  resolveMarket(eventName, winningOutcomeName) {
    const market = this.market[eventName]
    assert.ok(market !== undefined, new Error(`Event '${eventName}' does not exist.`))
    assert.ok(
      market.outcomes.has(winningOutcomeName) !== undefined,
      new Error(`Outcome '${winningOutcomeName}' does not exist for event '${eventName}'.`)
    )

    const pools = market.pools
    const betValues = flatten(Object.values(pools)).map(([_, amount]) => amount)
    const totalAmount = betValues.reduce((total, amount) => total + amount, 0)

    const rewards = {}

    // Participants keep the correctly places bets.
    forEach(pools, (bets, outcomeName) => {
      bets.forEach(([participant, amount]) => {
        if (rewards[participant] === undefined) {
          rewards[participant] = 0
        }
        if (outcomeName === winningOutcomeName) {
          rewards[participant] += amount
        }
      })
    })

    // The total amount of bets for the winning outcome.
    const totalAmountOnWinningOutcome = pools[winningOutcomeName].reduce(
      (total, [_, amount]) => total + amount,
      0
    )

    // calculate the rest of the money
    const restOfTheMoney = totalAmount - totalAmountOnWinningOutcome

    // distribute the rest of the money among the winners proportionally to the amount of money they bet
    pools[winningOutcomeName].forEach(([participant, amount]) => {
      rewards[participant] += (amount / totalAmountOnWinningOutcome) * restOfTheMoney
    })

    return { rewards, totalAmount }
  }

  getMarket() {
    return this.market
  }
}
