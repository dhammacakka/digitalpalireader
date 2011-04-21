var G_outwords = new Array();  // the raw output
var G_shortdefpost = new Array();

var devDump = 0;

var G_stopAnalyzing = 0;

function outputAnalysis(input,frombox)
{
	
	
	
	//devO('',1,1);
	G_outwords = [];
	shortdefpre = [];
	G_shortdefpost = [];
		
	input = toVel(input);

	// update permalink

	try {
		var oldurl = mainWindow.gBrowser.selectedTab.linkedBrowser.contentDocument.location.href;
		if(/analysis=/.exec(oldurl)) var newurl = oldurl.replace(/analysis=[^&]+/,'analysis='+input);
		else var newurl = oldurl + '&analysis='+input;
		mainWindow.gBrowser.selectedTab.linkedBrowser.contentWindow.history.replaceState('Object', 'Title', newurl);
	}
	catch(ex) {
	}

	document.getElementById('anfs').innerHTML = '';


	var inputm = input.replace(/\u00B4/g, '"').replace(/xn/g, '"n');

	// ---------- housekeeping ----------
	
	input = input.replace(/\u00B7/g, '');
	input = input.replace(/\u00B4/g, '');
	input = input.replace(/"n/g, 'xn');
	//~ input = input.replace(/aa['"`]/g, 'a');
	//~ input = input.replace(/ii['"`]/g, 'i');
	//~ input = input.replace(/uu['"`]/g, 'u');
	input = input.replace(/([aiu])[aiu][’”]/g, "$1");
	input = input.replace(/n[’”]/g, ".m");
	input = input.replace(/[‘“’”`',{}?;!"-]/g, '');
	input = input.replace(/xn/g, '"n');
	input = input.toLowerCase();
	input = input.replace(/\.([^nmltd])/g, "$1");
	input = input.replace(/\.$/g, "");
	input = input.replace(/ .*/g, '');
	shortdefpre = [];

	if (input.length > 1)  // ---------- dont waste time with periods and commas ----------
	{
		if(typeof(G_manualCompoundInd[input]) == 'object' || typeof(G_manualCompoundDec[input]) == 'object') manualCompound(input); // let it tell us what is the match
		else analyzeword(input);  // will populate G_outwords, which is nested array - 1) full alternative compounds/words seperated by array entry "space", 2) parts of the alt. compounds seperated by "@", 3) alt. defs of the parts, seperated by "#", 4) info for each alt. def. seperated by "^" 
	}
	if (G_outwords.length == 0)
	{
		G_outwords.push([input,'0^' + input + '^3']);
	}
	outputDef(0,1,frombox); // perform the function in send.js; 0 means first match, 1 means this is coming from this js as opposed to the select box,frombox tells the output that we're coming from the input box (don't load hotlinks).
}


var G_illegalCompoundBreak = /[^aiueomn][^aiueo]/; // this assumes that a compound has to break at a vowel, nigahita or n.

function analyzeword (oneword, parts, partnames, shortdefpre, lastpart, parttrick) {
	if(DPR_prefs['altlimit'] != '' && G_outwords.length >= DPR_prefs['altlimit']) return;

	if(devCheck == 2 && G_stopAnalyzing) {
		return false;
	}

	var matchedword;
	var fullmatch;
	var fullnames;
	
	if (!parts) { // first iteration
		parts = [];
		partnames = [];
		parttrick = 0; // number of trick parts
		shortdefpre = [];
		matchedword = findmatch(oneword); // check for a single match
		if(devCheck == 2 && matchedword) return true;
	}
	else if (oneword.length > 1) { matchedword = findmatch(oneword,lastpart,null,parts.length); }  // check for an ending match
	
	if (matchedword) {
		if(devCheck > 0 && devDump == 1) devO('-- matched --');
		fullnames = partnames.concat([matchedword[0]]);
		fullmatch = parts.concat([matchedword[1]]); // each part is a fake array of alt part defs, seperated by "#"
		parttrick += matchedword[4];
		G_outwords.push([fullnames.join('-'),fullmatch.join('@'),parttrick]); // only when we match the end of the compound do we add results, making an array of partnames and one of parts (if any).
		if (matchedword[2]) {
			G_shortdefpost.push(shortdefpre.concat([matchedword[2]]).join('$')); 
		}
		else { G_shortdefpost.push(shortdefpre.join('$')); }
		if(devCheck == 2) {
			//if(G_outwords.length > 100) window.dump(G_outwords[G_outwords.length-1]);
			window.dump('*');
			G_stopAnalyzing = 1;
		}
	}
	
	var partword;
	var restword;
	
	var nextparts;
	var nextpartnames;
	var nexttrick;
	
	if(devCheck == 2 && G_stopAnalyzing) {
		return false;
	}

	out:
	for (var j = 1; j < oneword.length; j++)
	{
		partword = oneword.substring(0,oneword.length-j);
		restword = oneword.substring(oneword.length-j,oneword.length);

		if ((partword.length == 1 && (lastpart || !/[anhc]/.exec(partword))) || G_illegalCompoundBreak.exec(partword.charAt(partword.length-1)+restword.charAt(0)) != null) continue out;

		var newpart = findmatch(partword,lastpart,restword,parts.length); // check for matched part
		if (newpart) {
			nextparts = parts.concat(Array(newpart[1])); // add the part to our list of matched parts
			nextpartnames = partnames.concat(Array(newpart[0])); // add the part name to our list of matched part names
			nexttrick = parttrick + (newpart[4] ? newpart[4] : 0);
			analyzeword((newpart[3] ? newpart[3] : restword), nextparts, nextpartnames, (newpart[2] ? shortdefpre.concat(newpart[2]) : shortdefpre), partword,nexttrick); // repeat passing the old parts to be added;  newpart[3] is a modified version of the rest of the word
		}
		
	}
	return false;
	// dalert(parts + ' | ' + partnames + ' | ' + G_outwords);
}


function findmatch(oneword,lastpart,nextpart,partslength,trick)
{
	//ddump(oneword);
	//devDump = 1;
	//if(!lastpart && !nextpart) devO(typeof(G_irregNoun[oneword]) + ' ' + oneword);
	//if(devCheck > 0 && devDump == 1) devO(oneword);
		
	if(DPR_prefs['altlimit'] != '' && G_outwords.length >= DPR_prefs['altlimit']) return;
	if ((lastpart||nextpart) && isUncomp(oneword,lastpart,nextpart)) return;

// fudges

	if(oneword == 'a' && nextpart && nextpart.charAt(0) == 'a') return;

// tricks for parts that won't match otherwise

	if(nextpart && !trick) {

	// consonant insertion - for chayime, gives cha-y-ime, for ki~ncideva gives ki~nci-d-eva 

		if (/[dy]/.exec(oneword.charAt(oneword.length-1)) && /[aiueo]/.exec(nextpart.charAt(0)) && /[aiueo]/.exec(oneword.charAt(oneword.length-2)))
		{
			var trickmatch = findmatch(oneword.slice(0,-1),lastpart,nextpart,partslength,1);
			if (trickmatch) { 
				if(devCheck > 0 && devDump == 1) devO('trick16');
				return [trickmatch[0]+'-' + oneword.charAt(oneword.length-1), trickmatch[1]+'@0^' + oneword.charAt(0) + '^3', (trickmatch[2] ? trickmatch[2] : '')+'$',nextpart,1]; 
			} 
		}
	}


	//if((lastpart || nextpart) && oneword.length == 1 && !/[na]/.exec(oneword)) return null;


	var res = [];
	var resn = [];
	var resy;



// exact maches

	// PED matches

	if (typeof(mainda[oneword]) == 'object')
	{
		if(devDump > 0) devO('added PED exact: ' + oneword);
		for (i in mainda[oneword]) {
			res.push([oneword,mainda[oneword][i]]); 
		}
	}
	else if (typeof(G_irregNoun[oneword]) == 'string') {
		if(devDump > 0) devO('added IrregN exact: ' + oneword);
		var irregword = G_irregNoun[oneword].replace(/[0-9]$/,'');
		if(irregword != G_irregNoun[oneword]) {
			var irregno = parseInt(G_irregNoun[oneword].charAt(G_irregNoun[oneword].length-1));
			res.push([oneword,mainda[irregword][irregno]]);
		}
		else {
			for (i in mainda[G_irregNoun[oneword]]) {
				res.push([oneword,mainda[G_irregNoun[oneword]][i]]); 
			}
		}
	}
	else if (typeof(G_irregDec[oneword]) == 'object') {
		if(devDump > 0) devO('added IrregDec exact: ' + oneword);
		var irregword = G_irregDec[oneword][0].replace(/[0-9]$/,'');
		if(irregword != G_irregDec[oneword][0]) {
			var irregno = parseInt(G_irregDec[oneword][0].charAt(G_irregDec[oneword][0].length-1));
			res.push([oneword,mainda[irregword][irregno]]);
		}
		else {
			for (i in mainda[irregword]) {
				res.push([oneword,mainda[irregword][i]]); 
			}
		}
	}
	else if (!nextpart && typeof(G_irregVerb[oneword]) == 'string') {
		if(devDump > 0) devO('added IrregVerb exact: ' + oneword);
		var irregword = G_irregVerb[oneword].replace(/[0-9]$/,'');
		if(irregword != G_irregVerb[oneword]) {
			var irregno = parseInt(G_irregVerb[oneword].charAt(G_irregVerb[oneword].length-1));
			res.push([oneword,mainda[irregword][irregno]]);
		}
		else {
			for (i in mainda[irregword]) {
				res.push([oneword,mainda[irregword][i]]); 
			}
		}
	}

	// concise matches
	
	var resy = '';

	if (yt[oneword] && (!nextpart || yt[oneword][4] != 'V')) 
	{					
		if(devDump > 0) devO('added CPED exact: ' + oneword);
		resy = oneword; // for matching the dictionary entry in the output
	}
	else if (typeof(G_irregNoun[oneword]) == 'string') {
		if(devDump > 0) devO('added CPED Irreg exact: ' + oneword);
		var irregword = G_irregNoun[oneword].replace(/[0-9]$/,'');
		if(typeof(yt[irregword]) == 'object') resy = irregword;
	}
	else if (typeof(G_irregDec[oneword]) == 'object') {
		if(devDump > 0) devO('added CPED Irreg exact: ' + oneword);
		var irregword = G_irregDec[oneword][0].replace(/[0-9]$/,'');
		if(typeof(yt[irregword]) == 'object') resy = irregword;
	}
	else if (!nextpart && typeof(G_irregVerb[oneword]) == 'string') {
		if(devDump > 0) devO('added CPED Irreg exact: ' + oneword);
		var irregword = G_irregVerb[oneword].replace(/[0-9]$/,'');
		if(typeof(yt[irregword]) == 'object') resy = irregword;
	}

	// DPPN matches

	if (nameda[oneword]) 
	{					
		if(devDump > 0) devO('added DPPN exact: ' + oneword);
		resn.push([oneword,nameda[oneword]]);
	}
	else {
		for (i in G_dppnEnd) {
			if (nameda[oneword+G_dppnEnd[i]]) 
			{					
				if(devDump > 0) devO('added DPPN exact (ending added): ' + oneword);
				resn.push([oneword+G_dppnEnd[i],nameda[oneword+G_dppnEnd[i]]]);
			}
		}
	}


// make declensions

	if(!nextpart) { // don't do stem matching on compound parts
		
		// ---------- stem matching and converting ----------
		// this stuff is defined in declension.js
		
		var wtrN = []; // nouns, can be in compound
		var wtrV = []; // verbs, can't
		
		var wtrDup = []; // sort duplicates
		
		var endings = [];
		
		for (var k = 1; k < oneword.length; k++) //define sub-cut for analysis (length-k,oneword.length) and remaining string (0,length-k)
		{		
			endings[oneword.substring(k)] = k;
		}
		
		for(i in G_endings) {
			var gend = G_endings[i];  // gend[0] is ending, [1] is offset, [2] is min length of stem, [3] is new ending to add, [4] says is a verb	
			if(endings[gend[0]] && endings[gend[0]] > gend[2]) {
				var dec = oneword.substring(0, endings[gend[0]]+gend[1]) + gend[3];

				if (!isUncomp(oneword,lastpart,nextpart) && !wtrDup[dec]) {
					wtrDup[dec] = 1;

					if (gend[4] == 'v') { wtrV.push(dec); }
					else { 
						wtrN.push(dec); 
						if(/[aiu]/.exec(dec.charAt(dec.length-1))) { // long vowels
							wtrN.push(dec+dec.charAt(dec.length-1));
						}
					}
				}					
			}
			for (stem in G_altStem) {
				//if(/^ga/.exec(oneword)) devO('-- try ' + oneword +  ' ' +stem+ ' ' + gend[0]);
				if (endings[stem + gend[0]] && endings[stem + gend[0]] > gend[2] && (G_altStem[stem][1] && gend[4] == 'v' || !G_altStem[stem][1] && gend[4] == 'n')) 
				{
					for(gas0 in G_altStem[stem][0]) {
						var dec = oneword.substring(0, endings[stem + gend[0]]) + G_altStem[stem][0][gas0];
						//if(/^ga/.exec(oneword)) devO('-- got ' + dec + ' ' +stem+ ' ' + gend[0]);
						if(G_altStem[stem][2]) {
							//dec = dec.replace(/^([kgncjtdpbmyrlvsh.~"]{0,2}[aiu])[aiu]/,"$1");
						}
						if (isUncomp(oneword,lastpart,nextpart)) { continue; }

						if(wtrDup[dec]) continue;
						else wtrDup[dec] = 1;

						if (G_altStem[stem][2]) { wtrV.push(dec); }
						else { 
							wtrN.push(dec); 
							if(/[aiu]/.exec(dec.charAt(dec.length-1))) { // long vowels
								wtrN.push(dec+dec.charAt(dec.length-1));
							}
						}	
					}
				}
			}
		}				
		//dalert(wtrV);
	}
	if(!lastpart && !nextpart) {
		 
// verbal & nominal declensions			

		var wtr = wtrN.concat(wtrV);

	// PED declensions

		if (res.length == 0) 
		{				
			for (var b = 0; b < wtr.length; b++) // check through wtr variants that we set at the beginning
			{			
				var temp = wtr[b];
				if (mainda[temp] && !isIndec(temp)) 
				{			
					for (i in mainda[temp]) {
						res.push([temp,mainda[temp][i]]); 
					}
				}
				else if (typeof(G_irregDec[temp]) == 'object') {
					var irregword = G_irregDec[temp][0];
					if(/[0-9]$/.exec(irregword)) { // specific
						res.push([oneword,mainda[irregword.slice(0,-1)][parseInt(irregword.charAt(irregword.length-1))]]); 
					}
					else {
						for (i in mainda[irregword]) {
							res.push([oneword,mainda[irregword]]); 
						}
					}
				}
			}
		}
			
	// concise declensions

		if (!resy)
		{
			for (var b = 0; b < wtr.length; b++) // b for alternative types wtr
			{				
				var temp = wtr[b];
				
				if (yt[temp] && !resy && !isIndec(temp)) 
				{					
					resy = temp; // for matching the dictionary entry in the output
				}	
				else if (G_irregDec[temp] && typeof(yt[G_irregDec[temp][0]]) == 'object') {
					resy = G_irregDec[temp][0];
				}
				
			}
		}

	// DPPN declensions

		if (resn.length == 0)
		{
			for (var b = 0; b < wtr.length; b++) // b for alternative types wtr
			{				
				if (nameda[wtr[b]]) 
				{					
					resn.push([wtr[b],nameda[wtr[b]]]);
				}
			}
		}
		
	// check for declinable manual compounds
		
		if(res.length == 0 && resn.length == 0 && !resy) {
			for (var b = 0; b < wtr.length; b++) // b for alternative types wtr
			{				
				if (G_manualCompoundDec[wtr[b]]) 
				{					
					manualCompound(wtr[b]);
					return;
				}
			}
		}
	}
	else if(!nextpart) {
	
// compound endings only get nominal declensions


		if (res.length == 0) 
		{				
			for (var b = 0; b < wtrN.length; b++) // check through wtrN variants that we set at the beginning
			{			
				var temp = wtrN[b];
				if (mainda[temp] && !isIndec(temp)) 
				{			
					for (i in mainda[temp]) {
						res.push([temp,mainda[temp][i]]); 
					}
				}
				else if (typeof(G_irregDec[temp]) == 'object' && G_irregDec[temp][1] == 'N') {
					var irregword = G_irregDec[temp][0];
					if(/[0-9]$/.exec(irregword)) { // specific
						res.push([oneword,mainda[irregword.slice(0,-1)][parseInt(irregword.charAt(irregword.length-1))]]); 
					}
					else {
						for (i in mainda[irregword]) {
							res.push([oneword,mainda[irregword]]); 
						}
					}
				}
				
			}
		}

	// DPPN declensions

		if (resn.length == 0)
		{
			for (var b = 0; b < wtrN.length; b++) // b for alternative types wtr
			{				
				if (nameda[wtrN[b]]) 
				{					
					resn.push([wtrN[b],nameda[wtrN[b]]]);
				}
			}
		}
		

	// concise variants

		if (!resy)
		{
			for (var b = 0; b < wtrN.length; b++) // b for alternative types wtrN
			{				

				var temp = wtrN[b];
				
				if (yt[temp] && !resy && !isIndec(temp)) 
				{					
					resy = temp; // for matching the dictionary entry in the output
				}						
				else if (G_irregDec[temp] && G_irregDec[temp][1] == 'N' && typeof(yt[G_irregDec[temp][0]]) == 'object') {
					resy = G_irregDec[temp][0];
				}
			}
		}
		if(partslength == 1) { // verbs in "compounds"
			if (res.length == 0) 
			{				
				//devO([lastpart,oneword].concat(wtrV)); 
				for (var b = 0; b < wtrV.length; b++) // check through wtrV variants that we set at the beginning
				{			
					var temp = wtrV[b];
					if (mainda[temp] && !isIndec(temp)) 
					{			
						for (i in mainda[temp]) {
							res.push([temp,mainda[temp][i]]); 
						}
					}
				}
			}

		// concise variants

			if (!resy)
			{
				for (var b = 0; b < wtrV.length; b++) // b for alternative types wtrV
				{				

					var temp = wtrV[b];
					
					if (yt[temp] && !resy && !isIndec(temp)) 
					{					
						resy = temp; // for matching the dictionary entry in the output
					}						
				}
			}
		}
	}

// alternative stems in compounds (see declension.js)

	for (b in G_altStemComp) 
	{			
		var asrx = new RegExp(b.replace(/\./,'\\.')+'$');
		if(!asrx.exec(oneword)) continue;
		var temp = oneword.replace(asrx,G_altStemComp[b][0]);
		//if(!lastpart) dalert(temp);
		if (res.length == 0) 
		{				
			if (mainda[temp]) 
			{			
				for (i in mainda[temp]) {
					res.push([temp,mainda[temp][i]]); 
				}
			}
			else if (typeof(G_irregDec[temp]) == 'object') {
				var irregword = G_irregDec[temp][0];
				if(/[0-9]$/.exec(irregword)) { // specific
					res.push([oneword,mainda[irregword.slice(0,-1)][parseInt(irregword.charAt(irregword.length-1))]]); 
				}
				else {
					for (i in mainda[irregword]) {
						res.push([oneword,mainda[irregword]]); 
					}
				}
			}
		}

	// concise 

		if (!resy)
		{
			if (yt[temp] && !resy && !isIndec(temp)) 
			{					
				resy = temp; // for matching the dictionary entry in the output
			}	
			else if (G_irregDec[temp] && typeof(yt[G_irregDec[temp][0]]) == 'object') {
				resy = G_irregDec[temp][0];
			}
			
		}
	}



// suffixes

	if(lastpart && !nextpart) {

	// adding the ` for special suffix only words
	
		if (res.length == 0 && !trick) {
			var trickmatch = findmatch('`'+oneword,lastpart,nextpart,partslength,1);
			if (trickmatch) { 
				return [oneword, trickmatch[1], (resy ? resy : (trickmatch[2] ? trickmatch[2] : '')) + '$',nextpart,1];  
			}

		}
	}	

	if(res.length == 0 && !resy) {


	// prefixes

		if(!lastpart && nextpart) {

		// adding the ` for special prefix only words

			if (res.length == 0 && !trick) {
				var trickmatch = findmatch(oneword+'`',lastpart,nextpart,partslength,1);
				if (trickmatch) { return [oneword, trickmatch[1], (resy ? resy : (trickmatch[2] ? trickmatch[2] : '')),nextpart,1];  }

			}
		}
		


	// special suffixes

		if (!nextpart && !trick)
		{

			for (var tempsuf = oneword.length-1; tempsuf > 0; tempsuf--) {
				var cutsuf = oneword.substring(oneword.length - tempsuf);
				//
				if (G_indeclinableEnding[cutsuf]) {
					var sufa = G_indeclinableEnding[cutsuf];
					//dalert((oneword.substring(0,oneword.length-tempsuf)+(sufa[1] ? sufa[1][0] : '')).replace(/([^.])m$/,"$1.m"));
					var desuf = findmatch((oneword.substring(0,oneword.length-tempsuf)+(sufa[1] ? sufa[1][0] : '')).replace(/([^.])m$/,"$1.m"),lastpart,null,partslength,1);  // run find function on desuffixed word, with optional addition 
					if (desuf) {
						var sufanames = [];
						var sufadefs = [];
						var sufashorts = [];
						
						for (i in sufa[0]) {
							var sufdefs = [];
							sufanames.push(sufa[0][i][0]);
							
							var tw = sufa[0][i][1].replace(/[0-9]$/,'');
							if(tw != sufa[0][i][1]) {
								oneno = parseInt(sufa[0][i][1].match(/[0-9]$/)[0]);
								sufdefs.push(mainda[tw][oneno] + '^' + tw + '^0' + (yt[tw] ? '^'+tw : ''));
							}
							else {
								for (k in mainda[tw]) {
									sufdefs.push(mainda[tw][k] + '^' + tw + '^0' + (yt[tw] ? '^'+tw : ''));
								}
							}
							if(typeof(nameda[tw]) == 'object') {
								for (k in nameda[tw]) {
									sufdefs.push(nameda[tw][k] + '^' + tw + '^0' + (yt[tw] ? '^'+tw : ''));
								}
							}
							if(typeof(yt[tw]) == 'object') {
								sufashorts.push(tw);
							}
							sufadefs.push(sufdefs.join('#'));
						}
						var outsuf =  [oneword.substring(0,oneword.length-tempsuf)+(sufa[1] ? sufa[1][1] : '') +'-'+sufanames.join('-'), desuf[1] + '@'+ sufadefs.join('@'), (desuf[2] ? desuf[2] + '$' : '') + sufashorts.join('$'),nextpart,1]; // manually add the multi part "compound"
						return outsuf;
					}
				}
			}			
		}		

	}
	
	// inner replacements	
	
	if (res.length == 0 && resn.length == 0 && !resy) {
		for(i in G_altInnerStem) {
			if(oneword.indexOf(i) > 0 && oneword.indexOf(i) < oneword.length - i.length) {
				var ist = G_altInnerStem[i][0];
				var trickmatch = findmatch(oneword.replace(i,ist),lastpart,nextpart,partslength);
				if (trickmatch) { return [oneword, trickmatch[1], ((trickmatch[2] ? trickmatch[2] : '')),nextpart,1];  }
			}
		}
	}

	if(nextpart) { 
	// do this if compound part (not end)

	// tricks

		if (res.length == 0 && resn.length == 0 && !resy && !trick) {


			var aiu1 = /[aiu]/.exec(oneword.charAt(oneword.length-1));
			var aiu2 = /[aiu]/.exec(nextpart.charAt(0));
			
			var aiueo1 = /[aiueo]/.exec(oneword.charAt(oneword.length-1));
			var aiueo2 = /[aiueo]/.exec(nextpart.charAt(0));
			var aiueo3 = /[aiueo]/.exec(nextpart.charAt(1));
			var aiueom = /[aiueo]/.exec(oneword.charAt(oneword.length-2));

		// verb + ukaam words (khu.msetukaamo, etc.)

			if(!lastpart && oneword.charAt(oneword.length-1) == 'u' && /^kaam/.exec(nextpart) && !aiueom) {
				if(/itu$/.exec(oneword) && oneword.length > 3) {
					var oa = [];
					oa[0] = [];
					oa[1] = [];
					
					if (!isUncomp(oneword.slice(0,-3)+'ati',lastpart,nextpart)) {
						var trickmatch = findmatch(oneword.slice(0,-3)+'ati',lastpart,nextpart,partslength,2);
						if (trickmatch) { 
							if(devCheck > 0 && devDump == 2) devO('trick00 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
							oa[0].push(trickmatch[1]);
							oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
						} 
					}
					if (!isUncomp(oneword.slice(0,-3)+'eti',lastpart,nextpart)) {
						var trickmatch = findmatch(oneword.slice(0,-3)+'aati',lastpart,nextpart,partslength,2);
						if (trickmatch) { 
							if(devCheck > 0 && devDump == 2) devO('trick01 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
							oa[0].push(trickmatch[1]);
							oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
						} 
					}
					if (!isUncomp(oneword.slice(0,-3)+'aati',lastpart,nextpart)) {
						var trickmatch = findmatch(oneword.slice(0,-3)+'aati',lastpart,nextpart,partslength,2);
						if (trickmatch) { 
							if(devCheck > 0 && devDump == 2) devO('trick02 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
							oa[0].push(trickmatch[1]);
							oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
						} 
					}
					if(oa[0].length > 0) {
						return [oneword,oa[0].join('#'),oa[1].join('$')]; 
					}
				}
				if(oneword.charAt(oneword.length-2) == 't' && !isUncomp(oneword.slice(0,-1)+'i',lastpart,nextpart)) {
					var trickmatch = findmatch(oneword.slice(0,-1)+'i',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick0');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
				if (!isUncomp(oneword.slice(0,-1)+'a',lastpart,nextpart)) {
					var trickmatch = findmatch(oneword.slice(0,-1)+'a',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick0');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}
				
			
		// shortened end vowel before next consonant; double end of this one
			
			if (aiu1 && !aiu2 && oneword.length > 2) 
			{
				if (!isUncomp(oneword+aiu1,lastpart,nextpart)) {
					var trickmatch = findmatch(oneword+oneword.charAt(oneword.length-1),lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick1');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}				

		// `h as in chah-a"ngehi 
			
			if (oneword.charAt(oneword.length-1) == 'h' && aiu2 && oneword.length > 2) 
			{
				if (!isUncomp(oneword.slice(0,-1),lastpart,nextpart)) {
					var trickmatch = findmatch(oneword.slice(0,-1),lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick1a');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}				


		// lost this vowel because next vowel, add 'a,i,u' (bhadd-ekarattassa, pa~nc-upaadaanakkhandhaa)

			if (!aiueo1 && aiueo2 && !aiueo3) 
			{
				var oa = [];
				oa[0] = [];
				oa[1] = [];
				if (!isUncomp(oneword+'a',lastpart,nextpart)) {
					//dalert(oneword);
					var trickmatch = findmatch(oneword+'a',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick2 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if (!isUncomp(oneword+'aa',lastpart,nextpart)) {
					//dalert(oneword);
					var trickmatch = findmatch(oneword+'aa',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick2 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if (!isUncomp(oneword+'i',lastpart,nextpart)) {
					var trickmatch = findmatch(oneword+'u',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick3 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if (!isUncomp(oneword+'u',lastpart,nextpart)) {
					var trickmatch = findmatch(oneword+'u',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick4 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if(oa[0].length > 0) {
					return [oneword,oa[0].join('#'),oa[1].join('$')]; 
				}

			}

		// doubled nextpart, removed this part (mohu-upasa.mhitaapi, cutuupapaata~naa.naaya)	

			if (oneword.charAt(oneword.length-1) == 'u' && nextpart.charAt(0) == 'u' && oneword.length > 3) 
			{
			
				if (!isUncomp(oneword.slice(0,-1)+'a',lastpart,nextpart)) {
					var trickmatch = findmatch(oneword.slice(0,-1)+'a',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick5');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}				

		// doubled nextpart, removed this part (vuccata-avuso)

			if (oneword.charAt(oneword.length-1) == 'a' && nextpart.charAt(0) == 'a' && oneword.length > 3)
			{
				if (!isUncomp(oneword.slice(0,-1)+'i',lastpart,nextpart)) {
					var trickmatch = findmatch(oneword.slice(0,-1)+'i',lastpart,'a'+nextpart,partslength,2);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick6');
						return [oneword.slice(0,-1), trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$','a'+nextpart,1]; 
					} 
					if (!isUncomp(oneword.slice(0,-1)+'u',lastpart,nextpart)) {
						var trickmatch = findmatch(oneword.slice(0,-1)+'u',lastpart,'a'+nextpart,partslength,2);
						if (trickmatch) { 
							if(devCheck > 0 && devDump == 1) devO('trick7');
							return [oneword.slice(0,-1), trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$','a'+nextpart,1]; 
						} 
					}

				}
			}				

		// `ar ending words in compounds

			if (oneword.charAt(oneword.length-1) == 'u' && nextpart.charAt(0) != 'u' && oneword.length > 3)
			{
				if (!isUncomp(oneword.slice(0,-1)+'ar',lastpart,nextpart)) { // masc u > ar
					var trickmatch = findmatch(oneword.slice(0,-1)+'ar',lastpart,nextpart,partslength,2);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick7b');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}				
			if (oneword.substring(oneword.length-2) == 'aa' && oneword.length > 4)
			{
				if (!isUncomp(oneword.slice(0,-1)+'r',lastpart,nextpart)) { // feminine aa > ar
					var trickmatch = findmatch(oneword.slice(0,-1)+'r',lastpart,nextpart,partslength,2);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick7b');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}				

	// compounded conjugations, sandhi

		// m as in ...
			
			if (oneword.charAt(oneword.length-1) == 'm' && oneword.charAt(oneword.length-2) != '.' && oneword.length > 3) 
			{
				var trickmatch = findmatch(oneword.substring(0,oneword.length-1),lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick8');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1]; 
				} 
			}
			
		// .m as in vassa.mvu.t.thaa
			
			if (oneword.charAt(oneword.length-1) == 'm' && oneword.charAt(oneword.length-2) == '.' && oneword.length > 3) 
			{
				var trickmatch = findmatch(oneword.slice(0,-2),lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick8a');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1]; 
				} 
			}
			
		// assa as in dukkhassantakaaro
			
			if (/..ass$/.exec(oneword)) 
			{
				var trickmatch = findmatch(oneword.replace(/ss$/,''),lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick9');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1];
				} 
			}
			
		// aana.m as in devaanamindo
			
			if (/..[aiu][aiu]nam$/.exec(oneword))
			{
				var trickmatch = findmatch(oneword.replace(/[aiu]nam$/,''),lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick10');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1];
				} 
			}
			
		// ~n as in `~nca				
			
			if (oneword.substring(oneword.length-2,oneword.length) == '~n' && oneword.length > 3) 
			{
				var trickmatch = findmatch(oneword.substring(0,oneword.length-2),lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick11 ' + trickmatch[1]);
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1];
				}
				else { // try indeclinables
					trickmatch = findmatch(oneword.substring(0,oneword.length-2)+'.m',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick11');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1]; 
					} 
				}
			}

		// n-[td] as in rattindivaa				
			
			if (oneword.charAt(oneword.length-1) == 'n' && /[td]/.exec(nextpart.charAt(0)) && oneword.length > 3) 
			{
				var trickmatch = findmatch(oneword.slice(0,-1),lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick11a');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1];
				}
				else { // try indeclinables
					trickmatch = findmatch(oneword.slice(0,-1)+'.m',lastpart,nextpart,partslength,1);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 1) devO('trick11a');
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1]; 
					} 
				}
			}

		// `va as in yatva, khva, yva, etc.				
			
			if (oneword.substring(oneword.length-2,oneword.length) == 'va' && !/[aiueo]/.exec(oneword.charAt(oneword.length-3)) && oneword.length > 2) 
			{
				var trickmatch = findmatch(oneword.slice(0,-2)+'o',lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick12');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1]; 
				} 
			}			
			
		
		// `ya as in myaaya.m, etc.				
			
			if (oneword.substring(oneword.length-2,oneword.length) == 'ya' && !/[aiueo]/.exec(oneword.charAt(oneword.length-3)) && oneword.length > 2) 
			{
				var trickmatch = findmatch(oneword.slice(0,-2)+'e',lastpart,nextpart,partslength,1);
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick12');
					return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : ''),nextpart,1]; 
				} 
			}			
			
		}			
		
	}

	if(lastpart) { 

// do this if compound part or end

	// tricks
	
		if (res.length == 0 && resn.length == 0 && !resy && trick != 1 && oneword.length > 3) { // allow from certain tricks
			var aiu1 = /[aiu]/.exec(oneword.charAt(0));
			if (aiu1 && oneword.charAt(0) == oneword.charAt(1)) // check for lengthened vowels, shorten
			{
				if (!isUncomp(oneword.substring(1),lastpart,nextpart)) {
					var trickmatch = findmatch(oneword.substring(1),lastpart,nextpart,partslength,1);
					if (trickmatch) {
						return [oneword, trickmatch[1], (trickmatch[2] ? trickmatch[2] : '') + '$',nextpart,1]; 
					} 
				}
			}				
		}

		if (res.length == 0 && resn.length == 0 && !resy && !trick && oneword.length > 3) {

		// consonant doubling - for maggappa.tipanno, gives magga-p-pa.tipanno

			if (oneword.charAt(0) == oneword.charAt(1) && oneword.length > 3 && !aiu1 && oneword.charAt(0) != 'y')
			{
				var trickmatch = findmatch(oneword.substring(1),lastpart,nextpart,partslength,1); // the 'pa.tipanno' in our example
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick15');
					return Array(oneword.charAt(0) + '-' + trickmatch[0], '0^' + oneword.charAt(0) + '^3@' + trickmatch[1], '$' + (trickmatch[2] ? trickmatch[2] : '')); 
				} 
			}

		// . consonant doubling

			if (/\.[tdn]/.exec(oneword.substring(0,2)) && /\.[tdn]/.exec(oneword.substring(2,4)) && oneword.charAt(1) == oneword.charAt(3) && oneword.length > 5)
			{
				var trickmatch = findmatch(oneword.substring(2),lastpart,nextpart,partslength,1); // the 'pa.tipanno' in our example
				if (trickmatch) { 
					if(devCheck > 0 && devDump == 1) devO('trick15');
					return Array(oneword.substring(0,2) + '-' + trickmatch[0], '0^' + oneword.substring(0,2) + '^3@' + trickmatch[1], '$' + (trickmatch[2] ? trickmatch[2] : '')); 
				} 
			}



			var aiu1 = /[aiu]/.exec(oneword.charAt(0));
			var aiu2 = /[aiu]/.exec(oneword.charAt(1));
			var aiu3 = /[aiu]/.exec(lastpart.charAt(lastpart.length-1));
			var aiu4 = /[aiu]/.exec(lastpart.charAt(lastpart.length-2));
			
			var aiueo2 = /[aiueo]/.exec(oneword.charAt(1));
			var aiueo3 = /[aiueo]/.exec(lastpart.charAt(lastpart.length-1));
			

			if (aiueo3 && (!aiu4 || lastpart.charAt(lastpart.length-1) == lastpart.charAt(lastpart.length-2)) && (!aiu1 || oneword.charAt(0) == lastpart.charAt(lastpart.length-1)) && lastpart.length > 1)
			{
						
				// check for lost this vowel because of last vowel, add 'a,i,u' (cakkhundriya.m,ceda.m)
				
				var oa = [];
				oa[0] = [];
				oa[1] = [];
				
				if (!isUncomp('a'+oneword,lastpart,nextpart)) {
					var trickmatch = findmatch('a'+oneword,lastpart,nextpart,partslength,2);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick12 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if (!isUncomp('i'+oneword,lastpart,nextpart)) {
					var trickmatch = findmatch('i'+oneword,lastpart,nextpart,partslength,2);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick12 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if (!isUncomp('u'+oneword,lastpart,nextpart)) {
					var trickmatch = findmatch('u'+oneword,lastpart,nextpart,partslength,2);
					if (trickmatch) { 
						if(devCheck > 0 && devDump == 2) devO('trick12 ' + oneword + ' ' + lastpart + ' '  + nextpart + ' '  + trickmatch[2]);
						oa[0].push(trickmatch[1]);
						oa[1].push((trickmatch[2] ? trickmatch[2] : '') + '$');
					} 
				}
				if(oa[0].length > 0) {
					return [oneword,oa[0].join('#'),oa[1].join('$')]; 
				}
			}				
		}
	}

	if(!lastpart && nextpart) {

	// do this if first compound part
	
		if (res.length == 0 && !trick) {
			// adding the ` for special prefix only words
			var trickmatch = findmatch(oneword+'`',lastpart,nextpart,partslength,1);
			if (trickmatch) { return [oneword, trickmatch[1], (resy ? resy : (trickmatch[2] ? trickmatch[2] : '')),nextpart,1];  }

		}
	}
	

	
	var altarray = [];

	if (res.length == 0 && resn.length == 0 && resy) { // only concise
		altarray.push('0^' + oneword.replace(/`$/,'') + '^2^' + resy);
	}
	else {
		if (res.length != 0) { for (var i in res) { altarray.push(res[i][1] + '^' + res[i][0] + '^0' + (resy ? '^'+resy : '')); } }
		if (resn.length != 0) { for (var j in resn) { altarray.push(resn[j][1] + '^' + resn[j][0] + '^1' + (resy ? '^'+resy : '')); } }
	}
	if(res.length == 0 && resn.length == 0 && !resy) { return; }
	if(devCheck > 0 && devDump == 1) devO('normal return');
	return [oneword.replace(/`$/,''),altarray.join('#'),resy,nextpart,0];  // add oneword to the beginning to let us put the word together later
}		

function manualCompound(fullword) {
	var i = (G_manualCompoundInd[fullword] ? G_manualCompoundInd[fullword] : G_manualCompoundDec[fullword]);
	var parta = []
	var infoa = [];
	var shorta = [];
	for(j in i) {
		var da = [];
		var oneword = i[j][1].replace(/[0-9]$/,'');
		if(oneword != i[j][1]) {
			oneno = parseInt(i[j][1].match(/[0-9]$/)[0]);
			da.push(mainda[oneword][oneno] + '^' + oneword + '^0' + (yt[oneword] ? '^'+oneword : ''));
		}
		else {
			for (k in mainda[oneword]) {
				da.push(mainda[oneword][k] + '^' + oneword + '^0' + (yt[oneword] ? '^'+oneword : ''));
			}
		}
		if(typeof(nameda[oneword]) == 'object') {
			for (k in nameda[oneword]) {
				da.push(nameda[oneword][k] + '^' + oneword + '^0' + (yt[oneword] ? '^'+oneword : ''));
			}
		}
		parta.push(i[j][0]);
		infoa.push(da.join('#'));
		shorta.push(yt[oneword] ? oneword : '');
	}
	G_outwords = [[parta.join('-'),infoa.join('@'),0]];
	G_shortdefpost = [shorta.join('$')]; 
}

function isIndec(word) { // indeclinible
	if(typeof(yt[word]) != 'object' || yt[word][1] != 'ind.') return false;
	else return true;
}

function isUncomp(word,lp,np) { // uncompoundable
	if(typeof(G_uncompoundable[word]) != 'number' || (!np && !lp)) return false;
	var uct = G_uncompoundable[word];
	
	switch(uct) {
		case 1:
			return true;
		break;
		case 2:
			if(lp) return true;
		break;
		case 3:
			if(np) return true;
		break;
		case 4:
			if(!lp&&np) return true;
		break;
		case 5:
			if(!np&&lp) return true;
		break;
	}
	return false;
}

