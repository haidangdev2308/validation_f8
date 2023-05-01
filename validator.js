function Validator(formSelector) {

	var formRules = {};

	formElement = document.querySelector(formSelector);

	var validatorRules = {
		required: function (value) {

			return value ? undefined : 'Vui lòng nhập trường này';
		},
		email: function (value) {
			var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
			return regex.test(value) ? undefined : 'Vui lòng nhập email';
		},
		min: function (min) {
			return function (value) {
				return value.length >= min ? undefined : `Vui lòng nhập tối thiểu ${min} kí tự`;
			};
		},
		max: function (max) {
			return function (value) {
				return value.length >= max ? undefined : `Vui lòng nhập tối thiểu ${max} kí tự`;
			};
		},
	};

	if (formElement) {
		var inputs = formElement.querySelectorAll('[name][rules]');

		for (var input of inputs) {
			var rules = input.getAttribute('rules').split('|');

			for (var rule of rules) {
				var isRuleHasValue = rule.includes(':');
				if (isRuleHasValue) {
					var ruleInfo = rule.split(':');
					rule = ruleInfo[0];
				}
				var ruleFunc = validatorRules[rule];

				if (isRuleHasValue) {
					ruleFunc = ruleFunc(ruleInfo[1]);
				}
				if (Array.isArray(formRules[input.name])) {
					formRules[input.name].push(ruleFunc);
				} else {
					formRules[input.name] = [ruleFunc];
				}
			}

			input.onblur = handleValidate;
			input.oninput = handleValidate;
		}

		function handleValidate(event) {
			var rules = formRules[event.target.name];
			var errorMessage;
			var errorElement = event.target.closest('.form-group').querySelector('.form-message');
			rules.some((rule) => {
				errorMessage = rule(event.target.value);
				return errorMessage;
			});

			if (errorMessage) {
				errorElement.innerText = errorMessage;
				event.target.closest('.form-group').classList.add('invalid');
			} else {
				errorElement.innerText = '';
				event.target.closest('.form-group').classList.remove('invalid');
			}
			return !!errorMessage; // True -> có lỗi
		}
	}

	formElement.onsubmit = (e) => {
		e.preventDefault();
		var inputs = formElement.querySelectorAll('[name][rules]');
		var isValid = true; 

		for (var input of inputs) {
			if (handleValidate({ target: input })) {
				isValid = false;
			}
		}
		if (isValid) {
			if (typeof this.onSubmit === 'function') {
				var enableInputs = formElement.querySelectorAll('[name][rules]');
				var formValue = Array.from(enableInputs).reduce((values, input) => {
					values[input.name] = input.value;
					return values;
				}, {});

				this.onSubmit(formValue);
			} else formElement.submit();
		}
	};
}