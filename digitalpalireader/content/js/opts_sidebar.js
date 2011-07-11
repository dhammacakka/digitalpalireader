var DPROpts = {
	tipitakaOptions: function () {
		document.getElementById('tsoContainer').setAttribute('collapsed',true);
		document.getElementById('tsoSetContainer').setAttribute('collapsed',true);
		document.getElementById('tsoSET').setAttribute('collapsed',true);
		document.getElementById('tsoBOOK').setAttribute('collapsed',true);
		document.getElementById('tsoMAT').setAttribute('collapsed',true);
		document.getElementById('tsoCO1').setAttribute('collapsed',true);
		document.getElementById('tsoCO2').setAttribute('collapsed',true);
		document.getElementById('tsoCO3').setAttribute('collapsed',true);
		document.getElementById('tsoBO').setAttribute('collapsed',true);
		
		var which = document.getElementById('tipType').selectedIndex;
		switch(which) {
			case 1:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSET').removeAttribute('collapsed');
			break;
			case 2:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSET').removeAttribute('collapsed');
				document.getElementById('tsoBOOK').removeAttribute('collapsed');
			break;
			case 4:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSetContainer').removeAttribute('collapsed');
				document.getElementById('tsoCO1').removeAttribute('collapsed');
				document.getElementById('tsoCO2').removeAttribute('collapsed');
				document.getElementById('tsoCO3').removeAttribute('collapsed');
			break;
			case 5:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSetContainer').removeAttribute('collapsed');
				document.getElementById('tsoBO').removeAttribute('collapsed');
			break;
			case 7:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoMAT').removeAttribute('collapsed');
			break;
			case 8:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoMAT').removeAttribute('collapsed');
			break;
			case 9:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoMAT').removeAttribute('collapsed');
			break;
			case 11:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSetContainer').removeAttribute('collapsed');
				document.getElementById('tsoMAT').removeAttribute('collapsed');
				document.getElementById('tsoCO1').removeAttribute('collapsed');
				document.getElementById('tsoCO2').removeAttribute('collapsed');
				document.getElementById('tsoCO3').removeAttribute('collapsed');
			break;
			case 12:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSetContainer').removeAttribute('collapsed');
				document.getElementById('tsoMAT').removeAttribute('collapsed');
				document.getElementById('tsoBO').removeAttribute('collapsed');
			break;
			case 14:
				document.getElementById('tsoContainer').removeAttribute('collapsed');
				document.getElementById('tsoSetContainer').removeAttribute('collapsed');
				document.getElementById('tsoCO2').removeAttribute('collapsed');
			break;
			default:
			break;
		}

	},
	
	dictAdvToggle:function() {
		var ao = document.getElementById('dictAdvOpts');
		if(!ao.getAttribute('collapsed')) ao.setAttribute('collapsed',true);
		else ao.removeAttribute('collapsed'); 
	},
	
	dictOptions:function () {
		var which = document.getElementById('dictType').value;

		document.getElementById('dictAdvOpts1').setAttribute('collapsed',true); // misc
		document.getElementById('dictAdvOpts2').setAttribute('collapsed',true); // mat
		document.getElementById('dictAdvOpts3').setAttribute('collapsed',true); // sets
		document.getElementById('soNO').collapsed = 'true';
		document.getElementById('soFT').collapsed = 'true';
		document.getElementById('soSW').collapsed = 'true';
		document.getElementById('soRX').collapsed = 'true';
		document.getElementById('soFZ').collapsed = 'true';
		switch (which) {
			case 'DPR': //dpr
				document.getElementById('soNO').removeAttribute('collapsed');
			break;
			case 'PED': // ped
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soFT').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'DPPN': // dppn
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soFT').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'CPED': // CPED
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soFT').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'CEPD': // CEPD
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soFT').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'MULTI': // Multi
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				//document.getElementById('soFT').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'ATT': // ATTH
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('dictAdvOpts3').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'TIK': // TIKA
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('dictAdvOpts3').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;
			case 'TIT': // Title
				document.getElementById('dictAdvOpts1').removeAttribute('collapsed');
				document.getElementById('dictAdvOpts2').removeAttribute('collapsed');
				document.getElementById('dictAdvOpts3').removeAttribute('collapsed');
				document.getElementById('soFZ').removeAttribute('collapsed');
				document.getElementById('soRX').removeAttribute('collapsed');
				document.getElementById('soSW').removeAttribute('collapsed');
			break;

		}
	},
	
}