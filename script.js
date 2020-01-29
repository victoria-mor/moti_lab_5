const SELECTED_HELP = '#d88144';
const SELECTED_TEAM = '#0a1237';
const SELECTED_CELL = '#172b69';
const UNITS = ['👼', '😈', '🙋'];
const ATTACK_SYMBOLS = ['💀','🤕','🏆'];
const COUNT_IN_TEAM = 2;
const TEAMS = permutation(COUNT_IN_TEAM, UNITS.length);
const LOSE = 0, DRAW = 1, WIN = 2;
let attack = [
	{
		unit_0: DRAW, 
		unit_1: WIN, 
		unit_2: LOSE
	}, 
	{
		unit_0: LOSE, 
		unit_1: DRAW, 
		unit_2: WIN
	}, 
	{
		unit_0: WIN, 
		unit_1: LOSE, 
		unit_2: DRAW
	}
];
const POINTS = {
	lose: -2, 
	draw: 0, 
	win: 2
};
let statGeneral = { 
	score: 0, 
	games: 0, 
	win: 0, 
	draw: 0, 
	lose: 0
};
let statActual = { 
	score: 0, 
	games: 0, 
	win: 0, 
	draw: 0, 
	lose: 0
};
let helpVisibility = false;
let userTeam = [0, 0];

$(document).ready(function(){
	fillMatrix();
	$('.help_cell').hide();
});

function fillMatrix() {
	let arrMinWin = []; // minimal guaranteed payoff for each strategy

	// create table to pay-off matrix — player payoffs with any of the opponent’s strategies
	// table header
	let payoffMatrix = "<tr><td></td>";
	for (let i = 0; i < TEAMS.length; i++) {
		payoffMatrix += '<td id="team_' + TEAMS[i][0] + '_' + TEAMS[i][1] + '_1">' + UNITS[TEAMS[i][0]] + UNITS[TEAMS[i][1]] + '</td>';
	}
	payoffMatrix += '<td colspan="2" class="help" onClick="$(`.help_cell`).toggle(); helpVisibility = !helpVisibility">  Подсказка  </td></tr>';
	// table body
	for (let i = 0; i < TEAMS.length; i++) {
		let min = undefined;
		payoffMatrix += '<tr><td id="team_' + TEAMS[i][0] + '_' + TEAMS[i][1] + '_0">' + UNITS[TEAMS[i][0]] + UNITS[TEAMS[i][1]] + '</td>';
		for (let i2 = 0; i2 < TEAMS.length; i2++) {
			let score = 0;
			for (let k = 0; k < COUNT_IN_TEAM; k++) {
				if (attack[TEAMS[i][k]]['unit_' + TEAMS[i2][k]] == WIN)
					score += POINTS.win;
				else if (attack[TEAMS[i][k]]['unit_' + TEAMS[i2][k]] == DRAW)
					score += POINTS.draw;
				else if (attack[TEAMS[i][k]]['unit_' + TEAMS[i2][k]] == LOSE)
					score += POINTS.lose; 
			}
			if (score < min || min == undefined)
				min = score;
			payoffMatrix += '<td id="cell_' + i + '_' + i2 + '">' + score + '</td>';
		}
		arrMinWin.push(min);
		payoffMatrix += '<td style="visibility: hidden;">... </td><td class="help_cell" id="max_min_' + i + '">' + min + '</td></tr>';
	}   
	$('#main_table').html(payoffMatrix);
	let maxPayoff = Math.max.apply(null, arrMinWin) // maximium guaranteed payoff 
	for(let i = 0; i < arrMinWin.length; i++) {
		if(arrMinWin[i] == maxPayoff) {
			$('#max_min_' + i).css('background-color', SELECTED_HELP);
		}
	}
	if(!helpVisibility)
		$('.help_cell').hide();
}

function fight() {
	fillMatrix();
	
	let enemyTeam = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)]
	for (var i = 0; i < 3; i++) {
		for(var k = 0; k < 3; k++) {
			$('#team_' + i + '_' + k + '_0').removeAttr('background-color');
			$('#team_' + i + '_' + k + '_1').removeAttr('background-color');
		}
	}
	$('#team_' + userTeam[0] + '_' + userTeam[1] + '_0').css('background-color', SELECTED_TEAM);
	$('#team_' + enemyTeam[0] + '_' + enemyTeam[1] + '_1').css('background-color', SELECTED_TEAM);
	
	for (var i = 0; i < TEAMS.length; i++) {
		for(var k = 0; k < TEAMS.length; k++) {
			$('#cell_' + i + '_' + k ).removeAttr('background-color');
			$('#cell_' + i + '_' + k ).css('color', 'black');
			if(userTeam[0] == TEAMS[i][0] && userTeam[1] == TEAMS[i][1] && enemyTeam[0] == TEAMS[k][0] && enemyTeam[1] == TEAMS[k][1]) {
				$('#cell_' + i + '_' + k ).css('background-color', SELECTED_CELL);
				$('#cell_' + i + '_' + k ).css('color', 'white');
				if (+$('#cell_' + i + '_' + k).html() < 0) {
					statActual.lose++;
					statGeneral.lose++;
					$('#last_score, #last_score_2, #status').css('color', 'red');
					$('#last_score, #last_score_2').html('(' + +$('#cell_' + i + '_' + k).html() + ')');
					$('#status').html('К сожалению сил ваших героев оказалось недостаточно, чтобы противостоять оппоненту.');
				} else if (+$('#cell_' + i + '_' + k).html() == 0) {
					statActual.draw++;
					statGeneral.draw++;
					$('#last_score, #last_score_2, #status').css('color', 'blue');
					$('#last_score, #last_score_2').html('(+' + +$('#cell_' + i + '_' + k).html() + ')');
					$('#status').html('Ваши с противником силы равны, и после затяжного боя никто не вышел победителем.');
				} else if (+$('#cell_' + i + '_' + k).html() > 0) {
					statActual.win++;
					statGeneral.win++;
					$('#last_score, #last_score_2, #status').css('color', 'green');
					$('#last_score, #last_score_2').html('(+' + +$('#cell_' + i + '_' + k).html() + ')');
					$('#status').html('Победа! Ваши герои выжили и победили противников!');
				}
				statActual.score += +$('#cell_' + i + '_' + k).html();
				statGeneral.score += +$('#cell_' + i + '_' + k).html();
			}
		}
	}
	statActual.games++;
	statGeneral.games++;
	for(let key in statActual) {
		$('#' + key).html(statActual[key]);
		$('#' + key + '_all').html(statGeneral[key]);
	}
}

function changeAttack(unit1, unit2, direction) { 
	if(direction) { // direction false - left, true - right
		if(attack[unit1]['unit_' + unit2] == LOSE)
			attack[unit1]['unit_' + unit2] = DRAW;
		else if(attack[unit1]['unit_' + unit2] == DRAW)
			attack[unit1]['unit_' + unit2] = WIN;
		else if(attack[unit1]['unit_' + unit2] == WIN)
			attack[unit1]['unit_' + unit2] = LOSE;	
	} else {
		if(attack[unit1]['unit_' + unit2] == LOSE)
			attack[unit1]['unit_' + unit2] = WIN;
		else if(attack[unit1]['unit_' + unit2] == DRAW)
			attack[unit1]['unit_' + unit2] = LOSE;
		else if(attack[unit1]['unit_' + unit2] == WIN)
			attack[unit1]['unit_' + unit2] = DRAW;	
	}
	$('#attack_' + unit1 + '_' + unit2).html(ATTACK_SYMBOLS[attack[unit1]['unit_' + unit2]]);
	for(let key in statActual) {
		statActual[key] = 0;
		$('#' + key).html(statActual[key]);
	}
	fillMatrix();
}

function changeUnit(unit, direction) {
	if(direction) {	// direction false - down, true - up
		if(userTeam[unit] == 2)
			userTeam[unit] = 0;
		else
			userTeam[unit]++;
	} else {
		if(userTeam[unit] == 0)
			userTeam[unit] = 2;
		else 
			userTeam[unit]--;
	}
	$('#unit_' + unit).html(UNITS[userTeam[unit]]);
}

function permutation(k, n) {
	let arrResult = [];
	for(let i = 0; i < k; i++) {
		for(let t = 0; t < n ** k; t++) {
			if(i == 0) {
				arrResult[t] = [];
			}
			arrResult[t][i] = Math.floor(t / n ** (k - i - 1)) % n;
		}
	}
	return arrResult;
}
