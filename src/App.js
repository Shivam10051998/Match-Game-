import { useEffect, useState,useCallback, useRef } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  Button,
  DialogTitle,
} from "@mui/material";
import Card from "./card";
import "./app.scss";

const uniqueCardsArray = [
  {
    type: "text_1",
    image: require(`./images/text_1.png`),
  },
  {
    type: "text_2",
    image: require(`./images/text_2.png`),
  },
  {
    type: "text_3",
    image: require(`./images/text_3.png`),
  },
  {
    type: "text_4",
    image: require(`./images/text_4.png`),
  },
  {
    type: "text_5",
    image: require(`./images/text_5.png`),
  },
  {
    type: "text_6",
    image: require(`./images/text_6.png`),
  },
];

function shuffleCards(array) {
  const length = array.length;
  for (let i = length; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * i);
    const currentIndex = i - 1;
    const temp = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temp;
  }
  return array;
}
export default function App() {
  const [cards, setCards] = useState(() =>
    shuffleCards(uniqueCardsArray.concat(uniqueCardsArray))
  );
  const [openCards, setOpenCards] = useState([]);
  const [clearedCards, setClearedCards] = useState({});
  const [shouldDisableAllCards, setShouldDisableAllCards] = useState(false);
  const [moves, setMoves] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [newScore, setNewScore] = useState(0);

  const timeout = useRef(null);

  const disable = () => {
    setShouldDisableAllCards(true);
  };
  const enable = () => {
    setShouldDisableAllCards(false);
  };

  const checkCompletion = useCallback(() => {
    if (Object.keys(clearedCards).length === uniqueCardsArray.length) {
      setShowModal(true);
    }
  },[clearedCards]) 

  const evaluate = useCallback(() => {
    const [first, second] = openCards;
    enable();
    if (cards[first].type === cards[second].type) {
      setNewScore(newScore + 100);
      setClearedCards((prev) => ({ ...prev, [cards[first].type]: true }));
      setOpenCards([]);
      return;
    }
    // This is to flip the cards back after 500ms duration
    timeout.current = setTimeout(() => {
      setNewScore(newScore - 50);
      setOpenCards([]);
    }, 500);
  },[cards, newScore, openCards])  


  const handleCardClick = (index) => {
    if (openCards.length === 1) {
      setOpenCards((prev) => [...prev, index]);
      setMoves((moves) => moves + 1);
      disable();
    } else {
      clearTimeout(timeout.current);
      setOpenCards([index]);
    }
  };

  useEffect(() => {
    let timeout = null;
    if (openCards.length === 2) {
      timeout = setTimeout(evaluate, 300);
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [evaluate, openCards]);

  useEffect(() => {
    checkCompletion();
  }, [checkCompletion, clearedCards]);


  const checkIsFlipped = (index) => {
    return openCards.includes(index);
  };

  const checkIsInactive = (card) => {
    return Boolean(clearedCards[card.type]);
  };

  const handleRestart = () => {
    setClearedCards({});
    setOpenCards([]);
    setShowModal(false);
    setMoves(0);
    setNewScore(0);
    setShouldDisableAllCards(false);
    // set a shuffled deck of cards
    setCards(shuffleCards(uniqueCardsArray.concat(uniqueCardsArray)));
  };

  return (
    <div className="App">
      <div className="parent-container">
        <header>
          <h3 className="tittle">Match the picture to correct rock type</h3>
        </header>
        <div className="container">
          {cards.map((card, index) => {
            return (
              <Card
                key={index}
                card={card}
                index={index}
                isDisabled={shouldDisableAllCards}
                isInactive={checkIsInactive(card)}
                isFlipped={checkIsFlipped(index)}
                onClick={handleCardClick}
              />
            );
          })}
        </div>
      </div>

      <footer>
        <div className="score">
          <div className="moves">
            <span className="bold">Score:</span> {newScore}
          </div>
        </div>
        <div className="restart">
          <Button onClick={handleRestart} color="primary" variant="contained">
            Restart
          </Button>
        </div>
      </footer>
      <Dialog
        open={showModal}
        disableBackdropClick
        disableEscapeKeyDown
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Hurray!!! You completed the challenge
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You completed the game in {moves} moves. Your score is {newScore} !
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRestart} color="primary">
            Restart
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
