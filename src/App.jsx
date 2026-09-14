import { useState, useEffect } from "react"; 

const questions = [ 
  { 
    question: "Which command is used to display output in C++?", 
    choices: [ 
      "print()", 
      "cout;", 
      "System.out.println", 
      "display()" 
    ], 
    answer: 1, 
    type: "choice" 
  }, 

  { 
    question: 'Print Output\n______("Hello, World!") using javascript;', 
    answerText: "console.log", 
    type: "text" 
  }, 

  { 
    question: "Which data type stores whole numbers?", 
    choices: [ 
      "String", 
      "double", 
      "int", 
      "boolean"  
    ],  
    answer: 2, 
    type: "choice" 
  }, 

  { 
    question: `#include <iostream> 
using namespace std; 

int main() { 
    cout << "Hello World!" 
    return 0; 
} 

Which line fixes the error?`, 
    choices: [ 
      'cout << "Hello World!";', 
      'cout << "Hello World!"', 
      'cout << "Hello World!";;' 
    ], 
    answer: 0, 
    type: "choice" 
  }, 

  { 
    question: `Add Two Numbers using Javascript 

Create two numbers and display their sum. 

Concept: Variables, operators 

let a = 10; 
let b = 5; 

Which code correctly displays the answer 15?`, 
    choices: [ 
      "console.log(a + b);", 
      "cout << a + b;", 
      "System.out.println(a + b);" 
    ], 
    answer: 0, 
    type: "choice" 
  } 
]; 

const TEST_MODE = true; 
const TIMER_SECONDS = TEST_MODE ? 10 : 30 * 60; 

function App() { 
  const savedProgress = JSON.parse( 
    localStorage.getItem("level1Progress") 
  ); 

  const [started, setStarted] = useState( 
    savedProgress ? true : false 
  ); 

  const [levelQuestions, setLevelQuestions] = useState( 
    savedProgress ? savedProgress.questions : [] 
  ); 

  const [currentQuestion, setCurrentQuestion] = useState( 
    savedProgress ? savedProgress.currentQuestion : 0 
  ); 

  const [selectedAnswer, setSelectedAnswer] = useState(null); 
  const [typedAnswer, setTypedAnswer] = useState(""); 

  const [hearts, setHearts] = useState( 
    savedProgress ? savedProgress.hearts : 3 
  ); 

  const [waitTime, setwaitTime] = useState(0); 
  const [waiting, setWaiting] = useState(false); 

  const [finished, setFinished] = useState(false); 
  const [answered, setAnswered] = useState(false); 
  const [isCorrect, setIsCorrect] = useState(false); 

  useEffect(() => { 
    const savedTime = Number( 
      localStorage.getItem("heartRefillTime") 
    ); 

    if (savedTime) { 
      const remaining = Math.max( 
        0, 
        Math.floor((savedTime - Date.now()) / 1000) 
      ); 

      if (remaining > 0) { 
        setwaitTime(remaining); 
        setWaiting(true); 
        setStarted(false); 
      } else { 
        localStorage.removeItem("heartRefillTime"); 
        setHearts(3); 
      } 
    } 
  }, []); 

  useEffect(() => {
    if (!waiting) {
      return;
    }

    const timer = setInterval(() => {
      const savedTime = Number(
        localStorage.getItem("heartRefillTime")
      );

      const remaining = Math.max(
        0,
        Math.floor((savedTime - Date.now()) / 1000)
      );

      setwaitTime(remaining);

      if (remaining === 0) {
        clearInterval(timer);

        setHearts(3);
        setWaiting(false);

        localStorage.removeItem("heartRefillTime");

        saveProgress(
          levelQuestions,
          currentQuestion,
          3
        );
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [waiting]);

  const startLevel = () => { 
    const savedTime = Number(localStorage.getItem("heartRefillTime"));
    if (savedTime) {
      const remaining = Math.max(0, Math.floor((savedTime - Date.now()) / 1000));
      if (remaining > 0) {
        setwaitTime(remaining);
        setWaiting(true);
        setStarted(false);
        return; 
      }
    }

    const saved = localStorage.getItem("level1Progress"); 

    if (saved) { 
      const progress = JSON.parse(saved); 

      setLevelQuestions(progress.questions); 
      setCurrentQuestion(progress.currentQuestion); 
      setHearts(progress.hearts); 
      setStarted(true); 

      return; 
    } 

    const randomQuestions = [...questions] 
      .sort(() => Math.random() - 0.5); 

    setLevelQuestions(randomQuestions); 
    setCurrentQuestion(0); 
    setSelectedAnswer(null); 
    setTypedAnswer(""); 
    setHearts(3); 
    setFinished(false); 
    setAnswered(false); 
    setIsCorrect(false); 
    setStarted(true); 
  }; 

  const saveProgress = ( 
    newQuestions, 
    newCurrentQuestion, 
    newHearts 
  ) => { 
    localStorage.setItem( 
      "level1Progress", 
      JSON.stringify({ 
        questions: newQuestions, 
        currentQuestion: newCurrentQuestion, 
        hearts: newHearts 
      }) 
    ); 
  }; 

  const checkAnswer = () => { 
    const current = levelQuestions[currentQuestion]; 

    let correct = false; 

    if (current.type === "text") { 
      correct = 
        typedAnswer.trim().toLowerCase() === 
        current.answerText.toLowerCase(); 
    } else { 
      correct = selectedAnswer === current.answer; 
    } 

    setIsCorrect(correct); 
    setAnswered(true); 

    if (!correct) { 
      const newHearts = Math.max(0, hearts - 1); 

      setHearts(newHearts); 

      saveProgress( 
        levelQuestions, 
        currentQuestion, 
        newHearts 
      ); 

      if (newHearts === 0) { 
        const endTime = Date.now() + TIMER_SECONDS * 1000;

        localStorage.setItem("heartRefillTime", endTime);

        setwaitTime(TIMER_SECONDS);
        setStarted(false);
        setAnswered(false);
        setWaiting(true);

        return; 
      } 
    } 
  }; 

  const continueQuestion = () => { 
    const nextQuestion = currentQuestion + 1; 

    if (nextQuestion >= levelQuestions.length) { 
      setFinished(true); 
      setStarted(false); 

      localStorage.removeItem("level1Progress"); 

      const oldXP = 
        Number(localStorage.getItem("xp")) || 0; 

      localStorage.setItem("xp", oldXP + 20); 

      return; 
    } 

    setCurrentQuestion(nextQuestion); 
    setSelectedAnswer(null); 
    setTypedAnswer(""); 
    setAnswered(false); 
    setIsCorrect(false); 

    saveProgress( 
      levelQuestions, 
      nextQuestion, 
      hearts 
    ); 
  }; 

  const leaveLevel = () => { 
    saveProgress( 
      levelQuestions, 
      currentQuestion, 
      hearts 
    ); 

    setStarted(false); 
    setSelectedAnswer(null); 
    setTypedAnswer(""); 
    setAnswered(false); 
  }; 

  return ( 
    <div className="phone"> 

      {!started && !finished && !waiting && ( 
        <div style={{ textAlign: "center", paddingTop: "600px" }}> 
          <button 
            className="check-button" 
            onClick={startLevel} 
          > 
            {savedProgress 
              ? "Continue Level 1" 
              : "Start Level 1"} 
          </button> 
        </div> 
      )} 

      {started && !waiting && levelQuestions.length > 0 && ( 
        <div> 

          <button onClick={leaveLevel}> 
            X 
          </button> 

          <h2>Level 1</h2> 

          <p> 
            {"❤️".repeat(hearts)} 
            {"🖤".repeat(3 - hearts)} 
          </p> 

          <div className="question-box"> 
            <h2> 
              {levelQuestions[currentQuestion].question} 
            </h2> 
          </div> 

          <p> 
            Question {currentQuestion + 1}/ 
            {levelQuestions.length} 
          </p> 

          {levelQuestions[currentQuestion].type === "text" && ( 
            <div> 

              <input 
                type="text" 
                value={typedAnswer} 
                onChange={(e) => 
                  setTypedAnswer(e.target.value) 
                } 
                disabled={answered} 
                placeholder="Type your answer" 
                className={ 
                  answered 
                    ? isCorrect 
                      ? "correct" 
                      : "wrong" 
                    : "" 
                } 
              /> 

              {answered && !isCorrect && ( 
                <p className="correct-answer"> 
                  Correct answer:{" "} 
                  {levelQuestions[currentQuestion].answerText} 
                </p> 
              )} 

            </div> 
          )} 

          {levelQuestions[currentQuestion].type === "choice" && ( 
            <div className="choices"> 

              {levelQuestions[ 
                currentQuestion 
              ].choices.map((choice, index) => { 

                let choiceClass = "choice"; 

                if (answered) { 

                  if ( 
                    index === 
                    levelQuestions[currentQuestion].answer 
                  ) { 
                    choiceClass = "choice correct"; 
                  } 

                  if ( 
                    index === selectedAnswer && 
                    index !== 
                    levelQuestions[currentQuestion].answer 
                  ) { 
                    choiceClass = "choice wrong"; 
                  } 

                } else if (selectedAnswer === index) { 
                  choiceClass = "choice selected"; 
                } 

                return ( 
                  <button 
                    key={index} 
                    className={choiceClass} 
                    onClick={() => 
                      !answered && 
                      setSelectedAnswer(index) 
                    } 
                  > 
                    <span> 
                      {String.fromCharCode(65 + index)} 
                    </span> 

                    {choice} 
                  </button> 
                ); 
              })} 

            </div> 
          )} 

          {!answered && ( 
            <button 
              className="check-button" 
              onClick={checkAnswer} 
            > 
              CHECK 
            </button> 
          )} 

          {answered && ( 
            <button 
              className="check-button" 
              onClick={continueQuestion} 
            > 
              {currentQuestion === levelQuestions.length - 1 
                ? "LEVEL 2" 
                : "CONTINUE"} 
            </button> 
          )} 

        </div> 
      )} 

      {waiting && (
        <div style={{ textAlign: "center", paddingTop: "50px" }}>

          <div style={{ textAlign: "right", paddingRight: "20px" }}>
            <button onClick={() => setWaiting(false)}>
              X
            </button>
          </div>

          <div style={{ paddingTop: "150px" }}>
            <h2>Out of Hearts! ❤️</h2>

            <p>
              Wait for a heart to refill.
            </p>

            <h2>
              {Math.floor(waitTime / 60)}:
              {String(waitTime % 60).padStart(2, "0")}
            </h2>
          </div>

        </div>
      )}

      {finished && ( 
        <div style={{ textAlign: "center", paddingTop: "200px" }}> 

          <h2>Level 1 Complete!</h2> 

          <p>You survived Level 1!</p> 

          <p>🎉 +20 XP</p> 

          <button 
            className="check-button" 
            onClick={() => { 
              setFinished(false); 
            }} 
          > 
            LEVEL 2 
          </button> 

        </div> 
      )} 

    </div> 
  ); 
} 

export default App;