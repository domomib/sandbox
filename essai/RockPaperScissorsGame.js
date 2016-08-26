var getUserChoice = function () {
    var choice = prompt("Do you choose rock, paper or scissors?");
    if ( choice === "rock" || choice === "paper" || choice === "scissors" ){
        return choice;
    }
    else {
        return  getUserChoice();
    }
};

var getComputerChoice = function () {
    var choice = Math.random();
    if (choice < 0.34) {
    	return "rock";
    } else if(choice <= 0.67) {
    	return "paper";
    } else {
    	return "scissors";
    }
};

var compare = function(choice1, choice2) {
  if ( choice1 === choice2) {
    return executeGame();   
  }
  else if (choice1 === "rock") {
      if (choice2 == "scissors") {
          return "rock wins";
      }
      else {
          return "paper wins";
      }
  }
  else if (choice1 === "paper") {
      if (choice2 == "rock") {
          return "paper wins";
      }
      else {
          return "scissors wins";
      }
  }
  else if ( choice1 === "scissors" ) {
    if (choice2 === "rock" ) {
        return "rock wins";
    }
    else {
        return "scissors wins";
    }
  }
};

var executeGame = function () {
    var userChoice = getUserChoice();
    var computerChoice = getComputerChoice();
    console.log("user: " + userChoice);
    console.log("Computer: " + computerChoice);
    console.log(compare(userChoice, computerChoice));
};

executeGame();