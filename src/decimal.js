(function( $ ) {
 
        $.fn.decimal = function( options ) {
 
        // This is the easiest way to have default options.
        var settings = $.extend({
            // These are the defaults.
            groupSeparator: ",",
            decimalSeparator: ".",
			allowNegative: true,
			decimal : true,
			
        }, options );
		
		var textBeforePaste;
		
		var deFormat = function(value) {
			return value.replace(new RegExp(settings.groupSeparator, 'g'), '');
		};
		
		var format = function(value) {
			var parts = value.toString().split(settings.decimalSeparator);
			if (parts.length > 0) {
				parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, settings.groupSeparator);
				if (parts.length == 1) {
					return parts[0];
				} else if (parts.length == 2) {
					if (parts[1].length == 0) {
						return parts[0];
					}
					else if (parts[1].length > 1) {
						// remove additional zeros
						parts[1] = parts[1].replace(/0*$/g, '');
						if (parts[1].length == 0) {
							parts[1] = "0";
						}
					}
					return parts.join(settings.decimalSeparator);
				}
			}
			return "";
		};
		
		return this.filter( "input" ).each(function() {
			var input = $(this);
					
			input.val(format(input.val()));
			
			input.keypress(function(event) {
				var curPos = $(input).caret();
				var selectedText = $(input).range().text;
				
				var val = input.val();
				
				// update status
				var hasNegativeSign = val.startsWith("-");
				var hasNegativeZero = val.startsWith("-0");
				var hasZero = val.startsWith("0");
				var hasSeparator = val.indexOf(settings.decimalSeparator) > 0;
				
				var specialKey = event.ctrlKey || event.which == 0 || event.which == 8;
				var charCode = String.fromCharCode(event.which);
				
				if (('0' <= charCode) && (charCode <= '9')) {
					// more than one zero at the beginning is not allowed
					if (charCode == '0') {
						if ((curPos > 0 && hasZero && !hasSeparator) || (curPos > 1 && hasNegativeZero && !hasSeparator)) {
							// canceling
							event.preventDefault();
						}
					}
					
				} else if (charCode == '-') {
					if (!settings.allowNegative || curPos != 0 || hasNegativeSign) {
						if (!selectedText.contains("-")) {
							// canceling
							event.preventDefault();
						}
					}
				} else if (charCode == settings.decimalSeparator) {
					// if is integer
					if (!settings.decimal || hasSeparator) {
						// canceling
						event.preventDefault();
						return;
					}
					var pos = 0;
					if (hasNegativeSign) {
						pos = 1;
					}
					// if cursor on the first position or after '-'
					if (curPos == pos) {
						// canceling
						event.preventDefault();
					}								
					// if another key was down
					// if entered decimal separator char
				} else if (!specialKey) {
					event.preventDefault();
				}
			});
			
			input.focus(function(event) {
				var cursorPosition = $(input).caret();
				var val = input.val();
				
				// text at the left of cursor
				var text = val.substring(0, cursorPosition); 
				// count how many separators there are at left
				var separatorsFound = (text.match(new RegExp(settings.groupSeparator, "g")) || []).length;
				
				input.val(deFormat(val));				
				$(input).caret(cursorPosition - separatorsFound);
			});
			
			input.blur(function(event) {
				var newValue;
				if (textBeforePaste) {
					// unformat the pasted text
					var pastedValue = deFormat(input.val());
					if (isNaN(pastedValue)) {
						// restore previous value
						newValue = textBeforePaste;
					}
					else {
						newValue = format(pastedValue)
					}
				}
				else {
					newValue = format(input.val())
				}
				
				textBeforePaste = null;
				input.val(newValue);
			});
			
			input.on("paste", function(event) {
				textBeforePaste = input.val();
			});
			
		});
 
    };
 
}( jQuery ));