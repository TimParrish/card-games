import React, { useState } from "react";
import axios from "axios";
//import styled from "styled-components";
import {
  DisplayHand,
  DisplayCardsDiv,
  GameControlsDiv,
  GameControlsButtonDiv,
  GameControlButton
} from "styles";
import { CardsOnFire } from "images";

let player_pile = [];//cards the player has
let player_card = [];//card the player drew

let dealer_pile = [];//cards the dealer has
let dealer_card = [];//card the dealer drew

let winner = "no one.";

function War() {
  const [deckId, setDeckId] = useState("");
  const [shuffled, setShuffled] = useState("");
//  const [cardsRemaining, setCardsRemaining] = useState("");
  const [, updateRender] = useState();
  const hiddenCardImage = CardsOnFire;
  var curDeck;
  //   const [playerNumberWins, setPlayerNumberWins] = useState(0);
  //   const [dealerNumberWins, setDealerNumberWins] = useState(0);
  void shuffled;

  // Create a new deck of cards and store the deck id for future API calls
  function startNewGame() {
    axios
    .get(`https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1`)
    .then(result => {
      result.data.success && console.log("Deck obtained");

      setDeckId(result.data.deck_id);
      setShuffled(result.data.shuffled);
//      setCardsRemaining(result.data.remaining);
      curDeck = result.data.deck_id;
      //clear the cards in the player and dealer hands
      player_pile = [];
      dealer_pile = [];
      //split the deck
      axios
      .get(`https://deckofcardsapi.com/api/deck/${curDeck}/draw/?count=52`)
      .then(result => {
        result.data.success && console.log("Beginning split");

        var i;
        for(i=0; i<52; i+=2) {
          let card1 = result.data.cards[i];
          //create a card object to push onto the player hand
          let drawn_card1 = {
            value: `${card1.value}`,
            suit: `${card1.suit}`,
            imageURL: `${card1.image}`,
            cardCode: `${card1.code}`,
            faceUp: `${card1.image}`
          };

          let card2 = result.data.cards[i+1];
          //create a card object to push onto the dealer hand
          let drawn_card2 = {
            value: `${card2.value}`,
            suit: `${card2.suit}`,
            imageURL: `${card2.image}`,
            cardCode: `${card2.code}`,
            faceUp: `${card2.image}`
          };

          //add 1 card to both player and dealer piles
          player_pile.push(drawn_card1)
          dealer_pile.push(drawn_card2)
        }
        //console.log(player_pile);
        //console.log(dealer_pile);
      })
      .catch(error => console.log(error));
    })
    .catch(error => console.log(error));
  }

  function draw() {
    //reset the pile for each player
    dealer_card = [];
    player_card = [];
    if(!gameWon()){
      console.log("\n");
      player_card.push(player_pile.pop());
      dealer_card.push(dealer_pile.pop());
  //    dealer_card.imageURL = hiddenCardImage;
      updateRender(n => !n);
      computeFlipWinner();
    }
  }

  async function drawTie(){
    var i;
    for(i = 0; i < 3; i++)//flip 3 cards face down
    {
      if(player_pile.length > 1){
        player_card.push(player_pile.pop());
        player_card[player_card.length-1].imageURL = hiddenCardImage;
      }
    }
    for(i = 0; i < 3; i++)//flip 3 cards face down
    {
      if(dealer_pile.length > 1){
        dealer_card.push(dealer_pile.pop());
        dealer_card[dealer_card.length-1].imageURL = hiddenCardImage;
      }
    }
    player_card.push(player_pile.pop());
    dealer_card.push(dealer_pile.pop());
    await sleepDelay(1);
    updateRender(n => !n);
    computeFlipWinner();
  }

  //computes who won the flip
  async function computeFlipWinner(){
    //get player card value
    var player_score = getCardValue(player_card[player_card.length-1]);
    //get deal card value
    var dealer_score = getCardValue(dealer_card[dealer_card.length-1]);

    if(player_score === dealer_score){//its a tie
      console.log("Tie");
      drawTie();
    }
    else if(player_score > dealer_score){//player wins the flip
      console.log("Player wins this round");
      while(player_card.length > 0){
        await sleepDelay(1);
        addCard(player_pile, player_card.pop());
        addCard(player_pile, dealer_card.pop());
      }
    }
    else{//dealer wins
      console.log("Dealer wins this round");
      while(player_card.length > 0){
        await sleepDelay(1);
        addCard(dealer_pile, player_card.pop());
        addCard(dealer_pile, dealer_card.pop());
      }
    }
  }

  //Gets te value of a given card
  function getCardValue(card){
    switch(card.value){
      case "ACE"://highest value card in the game
        return 14;
      case "KING":
        return 13;
      case "QUEEN":
        return 12;
      case "JACK":
        return 11;
      default:
        return card.value;
    }
  }

  //Adds the given card to the given pile
  function addCard(pile, card){
    var i
    card.imageURL = card.faceUp;
    for(i = pile.length; i > 0; i--)
      {
        pile[i] = pile[i-1];
      }
      pile[0] = card;
  }

  //checks if either player has an empty deck
  function gameWon(){
    if(player_pile.length === 0){
      winner = "the dealer.\nBetter luck next time.";
      return true;
    }
    if(dealer_pile.length === 0){
      winner = "the player.\nCongratulations! Please come again.";
      return true;
    }
    return false;
  }

  function sleepDelay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <>
      <DisplayCardsDiv>
        <DisplayHand type="player">
          <h2>Player Card</h2>
          {player_card.map(card => {
            return (
              <img
                src={`${card.imageURL}`}
                alt={`${card.value} of ${card.suit}`}
              />
            );
          })}
        </DisplayHand>
        <DisplayHand>
          <h2>Dealer Card</h2>
          {dealer_card.map(card => {
            return (
              <img
                src={`${card.imageURL}`}
                alt={`${card.value} of ${card.suit}`}
              />
            );
          })}
        </DisplayHand>
      </DisplayCardsDiv>

      <GameControlsDiv>
        <GameControlsButtonDiv>
          <GameControlButton onClick={startNewGame}>New Game</GameControlButton>
          <GameControlButton onClick={draw}>Hit</GameControlButton>
        </GameControlsButtonDiv>
        <h1>Welcome to WAR!</h1>
        <p>The deck ID is: {deckId}</p>
        <p>Player has: {player_pile.length} cards.</p>
        <p>Dealer has: {dealer_pile.length} cards.</p>
        <p>The winner of this game is: {winner}</p>
      </GameControlsDiv>
    </>
  );
}

export default War;
