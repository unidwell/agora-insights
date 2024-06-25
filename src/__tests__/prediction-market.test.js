import { expect } from 'chai'

import PredictionMarket from '../prediction-market.js'
import { stringify } from '../tools.js'

describe('PredictionMarket', () => {
  let market

  beforeEach(() => {
    market = new PredictionMarket()
  })

  it('should create a new vanilla market without any events', () => {
    const newMarket = market.getMarket()
    expect(newMarket).to.deep.equal({})
  })

  it('should create a new market with an event without any outcomes', () => {
    market.createEvent('SongCompetition')
    const newMarket = market.getMarket()

    expect(newMarket).to.deep.equal({
      SongCompetition: {
        outcomes: new Set(),
        participants: new Set(),
        pools: {},
        poolsTotal: {},
        total: 0,
      },
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
    expect(stringify(newMarket['SongCompetition'].pools)).to.equal('{"Song A":[["Alice",100]]}')
    expect(newMarket['SongCompetition'].poolsTotal['Song A']).to.equal(100)
    expect(newMarket['SongCompetition'].total).to.equal(100)
  })

  it('same user can bet two times', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song A', 'Alice', 150)
    const newMarket = market.getMarket()

    expect(stringify(newMarket['SongCompetition'].pools)).to.equal(
      '{"Song A":[["Alice",100],["Alice",150]]}'
    )
    expect(newMarket['SongCompetition'].poolsTotal['Song A']).to.equal(250)
    expect(newMarket['SongCompetition'].total).to.equal(250)
  })

  it('an event with two users placing bets', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 200)
    const newMarket = market.getMarket()

    expect(stringify(newMarket['SongCompetition'].outcomes)).to.equal('"Set(Song A,Song B)"')
    expect(stringify(newMarket['SongCompetition'].participants)).to.equal('"Set(Alice,Bob)"')
    expect(stringify(newMarket['SongCompetition'].pools)).to.equal(
      '{"Song A":[["Alice",100]],"Song B":[["Bob",200]]}'
    )
    expect(newMarket['SongCompetition'].poolsTotal['Song A']).to.equal(100)
    expect(newMarket['SongCompetition'].poolsTotal['Song B']).to.equal(200)
    expect(newMarket['SongCompetition'].total).to.equal(300)
  })

  // Check the distribution of rewards.
  it('should resolve the market for a given event and outcome', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 200)
    const newMarket = market.getMarket()

    // Alice should win.
    const outcomes = market.resolveMarket('SongCompetition', 'Song A')
    expect(stringify(outcomes)).to.equal('{"rewards":{"Alice":300,"Bob":0},"totalAmount":300}')
  })

  it('the rewards when Alice bets two times', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song A', 'Alice', 50)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 200)
    const newMarket = market.getMarket()

    // Alice should win.
    const outcomes = market.resolveMarket('SongCompetition', 'Song A')
    expect(stringify(outcomes)).to.equal('{"rewards":{"Alice":350,"Bob":0},"totalAmount":350}')
  })

  it('the rewards when Alice bets two times, but also against herself', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song B', 'Alice', 50)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 200)
    const newMarket = market.getMarket()

    // Alice should win.
    const outcomes = market.resolveMarket('SongCompetition', 'Song A')
    expect(stringify(outcomes)).to.equal('{"rewards":{"Alice":350,"Bob":0},"totalAmount":350}')
  })

  it('the current prediction market price of out outcomes', () => {
    market.createEvent('SongCompetition')
    market.addOutcomes('SongCompetition', ['Song A', 'Song B'])
    market.placeBet('SongCompetition', 'Song A', 'Alice', 100)
    market.placeBet('SongCompetition', 'Song B', 'Bob', 400)
    const newMarket = market.getMarket()

    // Alice should win.
    const outcomes = market.resolveMarket('SongCompetition', 'Song A')
    const priceA = market.getCurrentOutcomePrice('SongCompetition', 'Song A')
    const priceB = market.getCurrentOutcomePrice('SongCompetition', 'Song B')
    expect(priceA).to.equal(0.2)
    expect(priceB).to.equal(0.8)
  })
})
