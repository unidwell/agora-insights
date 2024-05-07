class PredictionMarket {
  constructor() {
    this.market = {}
  }

  createEvent(eventName) {
    this.market[eventName] = {
      outcomes: {},
      participants: [],
    }
  }

  addOutcome(eventName, outcomeName) {
    if (!this.market[eventName]) {
      throw new Error(`Event '${eventName}' does not exist.`)
    }

    this.market[eventName].outcomes[outcomeName] = 0
  }

  placeBet(eventName, outcomeName, amount, participant) {
    if (!this.market[eventName]) {
      throw new Error(`Event '${eventName}' does not exist.`)
    }

    if (!this.market[eventName].outcomes[outcomeName]) {
      throw new Error(`Outcome '${outcomeName}' does not exist for event '${eventName}'.`)
    }

    this.market[eventName].outcomes[outcomeName] += amount
    this.market[eventName].participants.push(participant)
  }

  getMarket() {
    return this.market
  }
}

// Usage example:
const market = new PredictionMarket()
market.createEvent('Election')
market.addOutcome('Election', 'Candidate A')
market.addOutcome('Election', 'Candidate B')
market.placeBet('Election', 'Candidate A', 100, 'Alice')
market.placeBet('Election', 'Candidate B', 200, 'Bob')

console.log(market.getMarket())
