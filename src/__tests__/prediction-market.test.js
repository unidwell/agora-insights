import { expect } from 'chai'

import PredictionMarket from '../prediction-market.js'
import { stringify } from '../tools.js'

describe('PredictionMarket', () => {
  let market

  beforeEach(() => {
    market = new PredictionMarket()
  })

  it('should create a new vanilla market without events', () => {
    market.createEvent('SongCompetition')
    const newMarket = market.getMarket()

    expect(newMarket).to.deep.equal({
      SongCompetition: { outcomes: new Set(), participants: new Set(), bets: new Map() },
    })
  })

  it('should add an outcome to an event', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A'])
    const newMarket = market.getMarket()

    expect(stringify(newMarket['SongCompetition'].outcomes)).to.equal('"Set(Song A)"')
  })

  it('should place a bet on an outcome', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    const newMarket = market.getMarket()

    expect(stringify(newMarket['SongCompetition'].participants)).to.equal('"Set(Alice)"')
    expect(stringify(newMarket['SongCompetition'].bets)).to.equal('{"Song A":[["Alice",100]]}')
  })

  it('same user can bet two times', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song A', 'Alice', 150)
    const newMarket = market.getMarket()

    expect(stringify(newMarket['SongCompetition'].bets)).to.equal(
      '{"Song A":[["Alice",100],["Alice",150]]}'
    )
  })

  it('an event with two users placing bets', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 200)
    const newMarket = market.getMarket()

    expect(stringify(newMarket['SongCompetition'].outcomes)).to.equal('"Set(Song A,Song B)"')
    expect(stringify(newMarket['SongCompetition'].participants)).to.equal('"Set(Alice,Bob)"')
    expect(stringify(newMarket['SongCompetition'].bets)).to.equal(
      '{"Song A":[["Alice",100]],"Song B":[["Bob",200]]}'
    )
  })

  // A test for resolveMarket(eventName, outcomeName) that resolves the market for a given event and outcome.
  it('should resolve the market for a given event and outcome', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 200)
    const newMarket = market.getMarket()
    const outcomes = market.resolveMarket('SongCompetition', 'Song A')
    console.log(stringify(newMarket['SongCompetition'].bets))
    console.log(outcomes)
    expect(stringify(outcomes)).to.equal('{"rewards":{"Alice":300,"Bob":0},"totalAmount":300}')
  })
})
