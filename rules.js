//
// Skirmish Base Script.
//
// contains the rules for starting and ending a game.
// as well as warning messages.
//
// /////////////////////////////////////////////////////////////////

receiveAllEvents(true);  // If doing this in eventGameInit, it seems to be too late in T2/T3, due to some eventResearched events triggering first.

include("multiplay/script/camTechEnabler.js");
include("multiplay/script/weather.js");

var lastHitTime = 0;
var cheatmode = false;
var maxOilDrums = 0;
var mainReticule = false;
var specs = {};


//add human readble method
var human = {
	scavengers : function () {
		if ( scavengers == true) {return _("Scavengers");}
		if ( scavengers == false) {return _("No Scavengers");}
		},

	alliancesType : function () {
		switch (alliancesType) {
			case 0: return _("No Alliances"); break;
			case 1: return _("Allow Alliances"); break;
			case 2: return _("Locked Teams"); break;
			case 3: return _("Locked Teams, No Shared Research"); break;
	
			}
		},

	powerType : function () {
		switch (powerType) {
			case 0: return _("Low Power Levels"); break;
			case 1: return _("Medium Power Levels"); break;
			case 2: return _("High Power Levels"); break;
			}
		},
 
	baseType : function () {
		switch (baseType) {
			case 0: return _("Start with No Bases"); break;
			case 1: return _("Start with Bases"); break;
			case 2: return _("Start with Advanced Bases"); break;
			}
		},
	colors :  [_("Green"),_("Orange"),_("Grey"),_("Black"),_("Red"),_("Blue"),_("Pink"),_("Cyan"),_("Yellow"),_("Purple"),_("White"),_("Bright blue"),_("Neon green"),_("Infrared"),_("Ultraviolet"),_("Brown")],
	teams : ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
	};

function writeGameSettings()
{
//	debug( [mapName, human.scavengers(), human.alliancesType(), human.powerType(), human.baseType(), version].join("\n");
	console([mapName, human.scavengers(), human.alliancesType(), human.powerType(), human.baseType()].join("\n"));
}

const CREATE_LIKE_EVENT = 0;
const DESTROY_LIKE_EVENT = 1;
const TRANSFER_LIKE_EVENT = 2;

function reticuleManufactureCheck()
{
	var structureComplete = false;
	var facs = [FACTORY, CYBORG_FACTORY, VTOL_FACTORY,];

	for (var i = 0, len = facs.length; i < len; ++i)
	{
		var onMapFacs = enumStruct(selectedPlayer, facs[i]);
		for (var j = 0, len2 = onMapFacs.length; j < len2; ++j)
		{
			if (onMapFacs[j].status === BUILT)
			{
				structureComplete = true;
				break;
			}
		}
	}

	if (structureComplete === true)
	{
		setReticuleButton(1, _("Manufacture (F1)"), "image_manufacture_up.png", "image_manufacture_down.png");
	}
	else
	{
		setReticuleButton(1, _("Manufacture - build factory first"), "", "");
	}
}

function reticuleResearchCheck()
{
	var structureComplete = false;
	var labs = [RESEARCH_LAB,];

	for (var i = 0, len = labs.length; i < len; ++i)
	{
		var onMapResLabs = enumStruct(selectedPlayer, labs[i]);
		for (var j = 0, len2 = onMapResLabs.length; j < len2; ++j)
		{
			if (onMapResLabs[j].status === BUILT)
			{
				structureComplete = true;
				break;
			}
		}
	}
	if (structureComplete === true)
	{
		setReticuleButton(2, _("Research (F2)"), "image_research_up.png", "image_research_down.png");
	}
	else
	{
		setReticuleButton(2, _("Research - build research facility first"), "", "");
	}
}

function reticuleBuildCheck()
{
	if (enumDroid(selectedPlayer, DROID_CONSTRUCT).length > 0)
	{
		setReticuleButton(3, _("Build (F3)"), "image_build_up.png", "image_build_down.png");
	}
	else
	{
		setReticuleButton(3, _("Build - manufacture constructor droids first"), "", "");
	}
}

function reticuleDesignCheck()
{
	var structureComplete = false;
	var HQS = [HQ,];


	for (var i = 0, len = HQS.length; i < len; ++i)
	{
		var onMapHQ = enumStruct(selectedPlayer, HQS[i]);
		for (var j = 0, len2 = onMapHQ.length; j < len2; ++j)
		{
			if (onMapHQ[j].status === BUILT)
			{
				structureComplete = true;
				break;
			}
		}
	}
	if (structureComplete === true )
	{
		setReticuleButton(4, _("Design (F4)"), "image_design_up.png", "image_design_down.png");
		setMiniMap(true);
		setDesign(true);
	}
	else
	{
		setReticuleButton(4, _("Design - construct HQ first"), "", "");
		setMiniMap(false);
	}
}

function reticuleCommandCheck()
{
	if (enumDroid(selectedPlayer, DROID_COMMAND).length > 0)
	{
		setReticuleButton(6, _("Commanders (F6)"), "image_commanddroid_up.png", "image_commanddroid_down.png");
	}
	else
	{
		setReticuleButton(6, _("Commanders - manufacture commanders first"), "", "");
	}
}

function setMainReticule()
{
	setReticuleButton(0, _("Close"), "image_cancel_up.png", "image_cancel_down.png");
	reticuleManufactureCheck();
	reticuleResearchCheck();
	reticuleBuildCheck();
	reticuleDesignCheck();
	setReticuleButton(5, _("Intelligence Display (F5)"), "image_intelmap_up.png", "image_intelmap_down.png");
	reticuleCommandCheck();
}

function reticuleUpdate(obj, eventType)
{
	var update_reticule = false;

	if (eventType === TRANSFER_LIKE_EVENT)
	{
		update_reticule = true;
	}
	else if (obj.player === selectedPlayer && obj.type === STRUCTURE)
	{
		if (obj.stattype === HQ || obj.stattype === RESEARCH_LAB || obj.stattype === CYBORG_FACTORY ||
			obj.stattype === VTOL_FACTORY || obj.stattype === FACTORY || obj.stattype === COMMAND_CONTROL)
		{
			update_reticule = true;
		}
	}
	else if (obj.player === selectedPlayer && obj.type === DROID)
	{
		if (obj.droidType === DROID_CONSTRUCT || obj.droidType === DROID_COMMAND)
		{
			update_reticule = true;
		}
	}

	if (mainReticule && update_reticule)
	{
		//Wait a tick for the counts to update
		const TICK_TIME = 100;
		queue("setMainReticule", TICK_TIME);
	}
}

function checkSpecs()
{
	//check spec users
	//
	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		var specFeature	={}
		if(enumStruct(playnum,SAT_UPLINK).length != 0)
		{
			specFeature["uplink"] = true;
		}

		var structs = [FACTORY, CYBORG_FACTORY, VTOL_FACTORY, RESEARCH_LAB, RESOURCE_EXTRACTOR];
		specFeature["factory"] = true;
		for (var i = 0; i < structs.length; ++i)
		{
			var onMapStructss = enumStruct(playnum, structs[i]);
			for (var j = 0; j < onMapStructss.length; ++j)
			{
				if (onMapStructss[j].status === BUILT)
				{
					specFeature["factory"] = false;
					break;
				}
			}
		}

		if (enumDroid(playnum, DROID_CONSTRUCT).length > 0)
		{
			specFeature["track"] = false;
		}
		else
		{
		specFeature["track"] = true;
		}
		for (var splaynum = 0; splaynum < maxPlayers; splaynum++)
			{
				if (playnum != splaynum && allianceExistsBetween(splaynum, playnum) && (enumDroid(splaynum, DROID_CONSTRUCT).length > 0)  )	// checking enemy player
				{
					specFeature["track"] = false;
				}
			}

		specFeature["oil"] = true;
		if(enumStruct(playnum,RESOURCE_EXTRACTOR).length != 0) 
		{
			specFeature["oil"] = true;
		}
		specFeature["oilReach"]=true;
		var oils = enumFeature(ALL_PLAYERS).filter(function(e){if(e.stattype==OIL_RESOURCE)return true;return false;})
		var trucks = enumDroid(playnum, DROID_CONSTRUCT);
		trucks.forEach(function(truck)
			{
				oils.forEach(function (oil)
				{
					if (droidCanReach(truck, oil.x, oil.y))
					{
						specFeature["oilReach"] = false;
					}
				})
			});
		if (specFeature["track"] && !specFeature["factory"] ) {specs[playnum] = true;}
		if (specFeature["uplink"] && specFeature["factory"] && specFeature["oil"] && specFeature["oilReach"]) {specs[playnum] = true;}
	}
}
function setupGame()
{
	
	checkSpecs();
	if (tilesetType == "URBAN")
	{
		replaceTexture("page-8-player-buildings-bases.png", "page-8-player-buildings-bases-urban.png");
		replaceTexture("page-9-player-buildings-bases.png", "page-9-player-buildings-bases-urban.png");
		replaceTexture("page-7-barbarians-arizona.png", "page-7-barbarians-urban.png");
	}
	else if (tilesetType == "ROCKIES")
	{
		replaceTexture("page-8-player-buildings-bases.png", "page-8-player-buildings-bases-rockies.png");
		replaceTexture("page-9-player-buildings-bases.png", "page-9-player-buildings-bases-rockies.png");
		replaceTexture("page-7-barbarians-arizona.png", "page-7-barbarians-kevlar.png");
		// for some reason rockies will use arizona babas
	}
	if (tilesetType != "ARIZONA")
	{
		setSky("texpages/page-25-sky-urban.png", 0.5, 10000.0);
	}

	if (specs[selectedPlayer] === true)
	{
		setMiniMap(true);
		setReticuleButton(4, "", "", "");
		setReticuleButton(5, "", "image_intelmap_up.png", "image_intelmap_down.png");
		setDesign(false);
		showInterface();
		hackPlayIngameAudio();
		return;
	}
	// Disabled by default
	setMiniMap(false);
	setDesign(false);
	setMainReticule();
	showInterface();
	mainReticule = true;
	hackPlayIngameAudio();

}

function eventGameLoaded()
{
	setupGame();
}

// fixme hack view oil on map
// down beacon
var addingViewOils= [];
function removeStructs()
{
	addingViewOils = enumFeature(ALL_PLAYERS).filter(function(e){if(e.stattype==OIL_RESOURCE)return true;return false;});
	addingViewOils.forEach(function (oil)
	{
		var struct = addStructure("A0ResourceExtractor", scavengerPlayer, oil.x*128, oil.y*128);
		removeStruct(struct);
	})
}

function eventGameInit()
{
	setupGame();
	writeGameSettings()
	
	
	// always at least one oil drum, and one more for every 64x64 tiles of map area
	maxOilDrums = (mapWidth * mapHeight) >> 12; // replace float division with shift for sync-safety
	for (var i = 0; i < maxOilDrums; ++i)
	{
		queue("placeOilDrum", 10000 * i);
	}

	hackNetOff();
	makeComponentAvailable("B4body-sml-trike01", scavengerPlayer);
	makeComponentAvailable("B3body-sml-buggy01", scavengerPlayer);
	makeComponentAvailable("B2JeepBody", scavengerPlayer);
	makeComponentAvailable("BusBody", scavengerPlayer);
	makeComponentAvailable("FireBody", scavengerPlayer);
	makeComponentAvailable("B1BaBaPerson01", scavengerPlayer);
	makeComponentAvailable("BaBaProp", scavengerPlayer);
	makeComponentAvailable("BaBaLegs", scavengerPlayer);
	makeComponentAvailable("bTrikeMG", scavengerPlayer);
	makeComponentAvailable("BuggyMG", scavengerPlayer);
	makeComponentAvailable("BJeepMG", scavengerPlayer);
	makeComponentAvailable("BusCannon", scavengerPlayer);
	makeComponentAvailable("BabaFlame", scavengerPlayer);
	makeComponentAvailable("BaBaMG", scavengerPlayer);
	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		if (powerType == 0)
		{
			setPowerModifier(85, playnum);
		}
		else if (powerType == 2)
		{
			setPowerModifier(125, playnum);
		}

		// insane difficulty is meant to be insane...
		if (playerData[playnum].difficulty == INSANE)
		{
			setPowerModifier(200 + 15 * powerType, playnum);
		}
		else if (playerData[playnum].difficulty == EASY)
		{
			setPowerModifier(70 + 5 * powerType, playnum);
		}

		setDroidLimit(playnum, 150, DROID_ANY);
		setDroidLimit(playnum, 10, DROID_COMMAND);
		setDroidLimit(playnum, 15, DROID_CONSTRUCT);

		enableStructure("A0CommandCentre", playnum);		// make structures available to build
		enableStructure("A0LightFactory", playnum);
		enableStructure("A0ResourceExtractor", playnum);
		enableStructure("A0PowerGenerator", playnum);
		enableStructure("A0ResearchFacility", playnum);

		setStructureLimits("A0LightFactory", 5, playnum);	// set structure limits
		setStructureLimits("A0PowerGenerator", 8, playnum);
		setStructureLimits("A0ResearchFacility", 5, playnum);
		setStructureLimits("A0CommandCentre", 1, playnum);
		setStructureLimits("A0ComDroidControl", 1, playnum);
		setStructureLimits("A0CyborgFactory", 5, playnum);
		setStructureLimits("A0VTolFactory1", 5, playnum);
	}
	applyLimitSet();	// set limit options

	const numCleanTech = 4;	// do x for clean
	const numBaseTech = 18; // do x for base
	var techlist = new Array(
		"R-Vehicle-Prop-Wheels",
		"R-Sys-Spade1Mk1",
		"R-Vehicle-Body01",
		"R-Comp-SynapticLink",
		"R-Wpn-MG1Mk1",
		"R-Defense-HardcreteWall",
		"R-Vehicle-Prop-Wheels",
		"R-Sys-Spade1Mk1",
		"R-Struc-Factory-Cyborg",
		"R-Defense-Pillbox01",
		"R-Defense-Tower01",
		"R-Vehicle-Body01",
		"R-Sys-Engineering01",
		"R-Struc-CommandRelay",
		"R-Vehicle-Prop-Halftracks",
		"R-Comp-CommandTurret01",
		"R-Sys-Sensor-Turret01",
		"R-Wpn-Flamer01Mk1",
		"R-Vehicle-Body05",
		"R-Struc-Research-Module",
		"R-Struc-PowerModuleMk1",
		"R-Struc-Factory-Module",
		"R-Struc-RepairFacility",
		"R-Sys-MobileRepairTurret01",
		"R-Vehicle-Engine01",
		"R-Wpn-MG3Mk1",
		"R-Wpn-Cannon1Mk1",
		"R-Wpn-Mortar01Lt",
		"R-Defense-Pillbox05",
		"R-Defense-TankTrap01",
		"R-Defense-WallTower02",
		"R-Sys-Sensor-Tower01",
		"R-Defense-Pillbox04",
		"R-Wpn-MG2Mk1",
		"R-Wpn-Rocket05-MiniPod",
		"R-Wpn-MG-Damage01",
		"R-Wpn-Rocket-Damage01",
		"R-Defense-WallTower01",
		"R-Defense-Tower06");

	for (var playnum = 0; playnum < maxPlayers; playnum++)
	{
		//Уничтожаем все строения наблюдателю, и открываем ему карту.
		//Технологии не выдаем.
		if(specs[playnum] === true)
		{
			setPower(0, playnum);
			var droids = enumDroid(playnum, DROID_ANY);
			droids.forEach(function(e){removeObject(e);});
			var structs = enumStruct(playnum);
			structs.forEach(function(e){removeObject(e);});
			addSpotter(1, 1, playnum, 50000, 0, 0);
			continue;
		}

		enableResearch("R-Sys-Sensor-Turret01", playnum);
		enableResearch("R-Wpn-MG1Mk1", playnum);
		enableResearch("R-Sys-Engineering01", playnum);

		// enable cyborgs components that can't be enabled with research
		makeComponentAvailable("CyborgSpade", playnum);

		if (baseType == CAMP_CLEAN)
		{
			setPower(1300, playnum);
			for (var count = 0; count < numCleanTech; count++)
			{
				completeResearch(techlist[count], playnum);
			}
			// Keep only some structures for insane AI
			var structs = enumStruct(playnum);
			for (var i = 0; i < structs.length; i++)
			{
				var s = structs[i];
				if (playerData[playnum].difficulty != INSANE
				    || (s.stattype != WALL && s.stattype != DEFENSE && s.stattype != GATE
				        && s.stattype != RESOURCE_EXTRACTOR))
				{
					removeObject(s, false);
				}
			}
		}
		else if (baseType == CAMP_BASE)
		{
			setPower(2500, playnum);
			for (var count = 0; count < numBaseTech; count++)
			{
				completeResearch(techlist[count], playnum);
			}
			// Keep only some structures
			var structs = enumStruct(playnum);
			for (var i = 0; i < structs.length; i++)
			{
				var s = structs[i];
				if ((playerData[playnum].difficulty != INSANE && (s.stattype == WALL || s.stattype == DEFENSE))
				    || s.stattype == GATE || s.stattype == CYBORG_FACTORY || s.stattype == COMMAND_CONTROL)
				{
					removeObject(s, false);
				}
			}
		}
		else // CAMP_WALLS
		{
			setPower(2500, playnum);
			for (var count = 0; count < techlist.length; count++)
			{
				completeResearch(techlist[count], playnum);
			}
		}
	}

	var techLevel = getMultiTechLevel();
	if (techLevel == 2)
	{
		grantTech(TECH_TWO);
	}
	else if (techLevel == 3)
	{
		grantTech(TECH_THREE);
	}
	// fixme hack add view oil on map

	addingViewOils = enumFeature(ALL_PLAYERS).filter(function(e){if(e.stattype == OIL_RESOURCE || e.stattype == OIL_DRUM)return true;return false;});
	addingViewOils.forEach(function (oil)
		{
		for (var playnum = 0; playnum < maxPlayers; playnum++)
			{
			addSpotter(oil.x, oil.y , playnum, 120, 0, 600); //550 mimimum time to add to map all view ojects
			}
		});
	queue("removeStructs", 60000);

	hackNetOn();
	setTimer("checkEndConditions", 3000);
	if (tilesetType === "URBAN" || tilesetType === "ROCKIES")
	{
		setTimer("weatherCycle", 45000);
	}
}





// /////////////////////////////////////////////////////////////////
// END CONDITIONS


function losingConditions(playnum)
{	
	var factories = countStruct("A0LightFactory", playnum ) + countStruct("A0CyborgFactory", playnum);
	var droids = countDroid(DROID_ANY, playnum);
	// Losing Conditions
	if (droids == 0 && factories == 0)
	{
		return true;
	}
	return false;
}

function checkEndConditions()
{

	// Losing Conditions
	if (losingConditions(selectedPlayer) && !specs[selectedPlayer] ) 
	{
		var gameLost = true;

		/* If teams enabled check if all team members have lost  */
		if (alliancesType == ALLIANCES_TEAMS || alliancesType == ALLIANCES_UNSHARED)
		{
			for (var playnum = 0; playnum < maxPlayers; playnum++)
			{
				if (playnum != selectedPlayer && allianceExistsBetween(selectedPlayer, playnum))
				{
					if (!losingConditions(playnum))
					{
						gameLost = false;	// someone from our team still alive
						break;
					}
				}
			}
		}

		if (gameLost)
		{
			gameOverMessage(false);
			removeTimer("checkEndConditions");
			return;
		}
	}

	// Winning Conditions
	var gamewon = true;

	// check if all enemies defeated
	if (!specs[selectedPlayer])
	{	
		for (var playnum = 0; playnum < maxPlayers; playnum++)
		{	
			if (playnum != selectedPlayer && !allianceExistsBetween(selectedPlayer, playnum) && !specs[playnum])	// checking enemy player
			{
				if (!losingConditions(playnum))
				{
					gamewon = false;	//one of the enemies still alive
					break;
				}
			}
		}
	}

	if (specs[selectedPlayer] === true)
	{
		for (var splaynum = 0; splaynum < maxPlayers; splaynum++)
		{
			// check one enemies defeated
			gamewon = true;
			for (var playnum = 0; playnum < maxPlayers; playnum++)
			{
				if (playnum != splaynum && !allianceExistsBetween(splaynum, playnum) && !specs[playnum])	// checking enemy player
				{
					if (!losingConditions(playnum))
					{
						gamewon = false;	//one of the enemies still alive
						break;
					}
				}
			}
			if (gamewon) 
			{
				break;
			}
		}			
	}

	if (gamewon)
	{
		//find win and lose players
		var statusWon = "spec"
		for (var playnum = 0; playnum < maxPlayers; playnum++)
		{
			if (specs[playnum])
			{
				continue;
			}
			if (losingConditions(playnum))
			{
				statusWon = "defeated" ;
				for (var splaynum = 0; splaynum < maxPlayers; splaynum++)
				{
					if (playnum != splaynum && allianceExistsBetween(splaynum, playnum) && !specs[playnum])
					{
						if (!losingConditions(splaynum))					{
							sgamewon = "won";	//one of the enemies still alive
							break;
						}
					}
				}
			}
			else
			{
				statusWon = "won"
			}
			console([statusWon, human.colors[playerData[playnum].colour], playerData[playnum].name, _("Team"), human.teams[playerData[playnum].team], _("Position"), playerData[playnum].position].join(" "))
			debug([statusWon, playerData[playnum].name, playerData[playnum].colour,  playerData[playnum].position].join(" "));
		}
		gameOverMessage(true);
		removeTimer("checkEndConditions");
	}
}

// /////////////////////////////////////////////////////////////////
// WARNING MESSAGES
// Base Under Attack
function eventAttacked(victimObj, attackerObj)
{
	if (gameTime > lastHitTime + 5000 && victimObj.player == selectedPlayer)
	{
		lastHitTime = gameTime;
		if (victimObj.type == STRUCTURE)
		{
			playSound("pcv337.ogg", victimObj.x, victimObj.y, victimObj.z);	// show position if still alive
		}
		else
		{
			playSound("pcv399.ogg", victimObj.x, victimObj.y, victimObj.z);
		}
	}
}

function eventDroidBuilt(droid, structure)
{
	if (droid.player === selectedPlayer)
	{
		reticuleUpdate(droid, CREATE_LIKE_EVENT);
	}
}

function eventStructureBuilt(struct, droid)
{
	if (struct.player === selectedPlayer)
	{
		reticuleUpdate(struct, CREATE_LIKE_EVENT);
	}
}

function eventStructureDemolish(struct, droid)
{
	if (struct.player === selectedPlayer)
	{
		reticuleUpdate(struct, DESTROY_LIKE_EVENT);
	}
}

function eventDestroyed(victim)
{
	if (victim.player === selectedPlayer)
	{
		reticuleUpdate(victim, DESTROY_LIKE_EVENT);
	}
}

function eventObjectTransfer(obj, from)
{
	if (obj.player === selectedPlayer || from === selectedPlayer)
	{
		reticuleUpdate(obj, TRANSFER_LIKE_EVENT);
	}
}

function eventResearched(research, structure, player)
{
	//if (research.name == "") debug("RESEARCH : " + research.fullname + "(" + research.name + ") for " + player);
	// iterate over all results
	for (var i = 0; i < research.results.length; i++)
	{
		var v = research.results[i];
		//if (research.name == "") debug("    RESULT : class=" + v['class'] + " parameter=" + v['parameter'] + " value=" + v['value'] + " filter=" + v['filterParameter'] + " filterval=" + v['filterValue']);
		for (var cname in Upgrades[player][v['class']]) // iterate over all components of this type
		{
			var parameter = v['parameter'];
			var ctype = v['class'];
			var filterparam = v['filterParameter'];
			if ('filterParameter' in v && Stats[ctype][cname][filterparam] != v['filterValue']) // more specific filter
			{
				//if (research.name == "") debug("    skipped param=" + parameter + " cname=" + cname);
				continue;
			}
			if (Stats[ctype][cname][parameter] instanceof Array)
			{
				var dst = Upgrades[player][ctype][cname][parameter].slice();
				for (var x = 0; x < dst.length; x++)
				{
					dst[x] += Math.ceil(Stats[ctype][cname][parameter][x] * v['value'] / 100);
				}
				Upgrades[player][ctype][cname][parameter] = dst;
				//debug("    upgraded to " + dst);
			}
			else if (Stats[ctype][cname][parameter] > 0) // only applies if stat has above zero value already
			{
				Upgrades[player][ctype][cname][parameter] += Math.ceil(Stats[ctype][cname][parameter] * v['value'] / 100);
				//if (research.name == "") debug("      upgraded " + cname + " to " + Upgrades[player][ctype][cname][parameter] + " by " + Math.ceil(Stats[ctype][cname][parameter] * v['value'] / 100));
			}
			//else if (research.name == "") debug("    passed " + Stats[ctype][cname][parameter] + " param=" + parameter + " cname=" + cname);
		}
	}
}

function eventCheatMode(entered)
{
	cheatmode = entered; // remember this setting
}

function eventChat(from, to, message)
{
	if (message == "bettertogether" && cheatmode)
	{
		for (var i in Upgrades[from].Brain)
		{
			if (Upgrades[from].Brain[i].BaseCommandLimit > 0) // is commander
			{
				Upgrades[from].Brain[i].BaseCommandLimit += 4;
				Upgrades[from].Brain[i].CommandLimitByLevel += 2;
				// you must set the thresholds this way, as an array, because of the clunky
				// way that this is implemented behind the scenes
				Upgrades[from].Brain[i].RankThresholds = [ 0, 2, 4, 8, 16, 24, 32, 48, 64 ];
			}
		}
		console("Made player " + from + "'s commanders SUPERIOR!");
	}
	if (message == "makesuperior" && cheatmode)
	{
		for (var i in Upgrades[from].Body)
		{
			if (Upgrades[from].Body[i].bodyClass === 'Droids' || Upgrades[from].Body[i].bodyClass === 'Cyborgs')
			{
				Upgrades[from].Body[i].HitPoints += 500;
				Upgrades[from].Body[i].HitPointPct += 100;
				Upgrades[from].Body[i].Armour += 500;
				Upgrades[from].Body[i].Thermal += 500;
				Upgrades[from].Body[i].Power += 500;
			}
		}
		console("Made player " + from + "'s units SUPERIOR!");
	}
}

function placeOilDrum()
{
	var drums = enumFeature(-1, "OilDrum").length;
	if (drums >= maxOilDrums)
	{
		return;
	}

	var x = syncRandom(mapWidth - 20) + 10;
	var y = syncRandom(mapHeight - 20) + 10;

	// see if the random position is valid
	var occupied = (enumRange(x, y, 2, ALL_PLAYERS, false).length > 0);
	var unreachable = true;
	for (var i = 0; i < maxPlayers; ++i)
	{
		if (propulsionCanReach("wheeled01", x, y, startPositions[i].x, startPositions[i].y))
		{
			unreachable = false;
			break;
		}
	}
	var terrain = terrainType(x, y);
	if (terrain == TER_WATER || terrain == TER_CLIFFFACE)
	{
		unreachable = true;
	}
	if (occupied || unreachable)
	{
		// try again in a different position after 1 second
		queue("placeOilDrum", 1000);
		return;
	}

	addFeature("OilDrum", x, y);
}

function eventPickup(feature, droid)
{
	if (feature.stattype == OIL_DRUM)
	{
		var delay;
		// generate Geom(1/6) distribution for oil drum respawn delay
		for (delay = 0; ; ++delay)
		{
			if (syncRandom(6) == 0)
			{
				break;
			}
		}
		// amounts to 10 minutes average respawn time
		queue("placeOilDrum", delay * 120000);
	}
}
