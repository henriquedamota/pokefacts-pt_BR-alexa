// sets up dependencies
const Alexa = require('ask-sdk-core')
const i18n = require('i18next')

// core functionality for fact skill
const GetNewFactHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		// checks request type
		return (
			request.type === 'LaunchRequest' ||
			(request.type === 'IntentRequest' &&
				request.intent.name === 'GetNewFactIntent')
		)
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
		// gets a random fact by assigning an array to the variable
		// the random item from the array will be selected by the i18next library
		// the i18next library is set up in the Request Interceptor
		const randomFact = requestAttributes.t('FACTS')
		// concatenates a standard message with the random fact
		const speakOutput = requestAttributes.t('GET_FACT_MESSAGE') + randomFact

		return (
			handlerInput.responseBuilder
				.speak(speakOutput)
				// Uncomment the next line if you want to keep the session open so you can
				// ask for another fact without first re-opening the skill
				// .reprompt(requestAttributes.t('HELP_REPROMPT'))
				.withSimpleCard(requestAttributes.t('SKILL_NAME'), randomFact)
				.getResponse()
		)
	}
}

const HelpHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return (
			request.type === 'IntentRequest' &&
			request.intent.name === 'AMAZON.HelpIntent'
		)
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
		return handlerInput.responseBuilder
			.speak(requestAttributes.t('HELP_MESSAGE'))
			.reprompt(requestAttributes.t('HELP_REPROMPT'))
			.getResponse()
	}
}

const FallbackHandler = {
	// The FallbackIntent can only be sent in those locales which support it,
	// so this handler will always be skipped in locales where it is not supported.
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return (
			request.type === 'IntentRequest' &&
			request.intent.name === 'AMAZON.FallbackIntent'
		)
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
		return handlerInput.responseBuilder
			.speak(requestAttributes.t('FALLBACK_MESSAGE'))
			.reprompt(requestAttributes.t('FALLBACK_REPROMPT'))
			.getResponse()
	}
}

const ExitHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return (
			request.type === 'IntentRequest' &&
			(request.intent.name === 'AMAZON.CancelIntent' ||
				request.intent.name === 'AMAZON.StopIntent')
		)
	},
	handle(handlerInput) {
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
		return handlerInput.responseBuilder
			.speak(requestAttributes.t('STOP_MESSAGE'))
			.getResponse()
	}
}

const SessionEndedRequestHandler = {
	canHandle(handlerInput) {
		const request = handlerInput.requestEnvelope.request
		return request.type === 'SessionEndedRequest'
	},
	handle(handlerInput) {
		console.log(
			`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`
		)
		return handlerInput.responseBuilder.getResponse()
	}
}

const ErrorHandler = {
	canHandle() {
		return true
	},
	handle(handlerInput, error) {
		console.log(`Error handled: ${error.message}`)
		console.log(`Error stack: ${error.stack}`)
		const requestAttributes = handlerInput.attributesManager.getRequestAttributes()
		return handlerInput.responseBuilder
			.speak(requestAttributes.t('ERROR_MESSAGE'))
			.reprompt(requestAttributes.t('ERROR_MESSAGE'))
			.getResponse()
	}
}

const LocalizationInterceptor = {
	process(handlerInput) {
		// Gets the locale from the request and initializes i18next.
		const localizationClient = i18n.init({
			lng: handlerInput.requestEnvelope.request.locale,
			resources: languageStrings,
			returnObjects: true
		})
		// Creates a localize function to support arguments.
		localizationClient.localize = function localize() {
			// gets arguments through and passes them to
			// i18next using sprintf to replace string placeholders
			// with arguments.
			const args = arguments
			const value = i18n.t(...args)
			// If an array is used then a random value is selected
			if (Array.isArray(value)) {
				return value[Math.floor(Math.random() * value.length)]
			}
			return value
		}
		// this gets the request attributes and save the localize function inside
		// it to be used in a handler by calling requestAttributes.t(STRING_ID, [args...])
		const attributes = handlerInput.attributesManager.getRequestAttributes()
		attributes.t = function translate(...args) {
			return localizationClient.localize(...args)
		}
	}
}

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
	.addRequestHandlers(
		GetNewFactHandler,
		HelpHandler,
		ExitHandler,
		FallbackHandler,
		SessionEndedRequestHandler
	)
	.addRequestInterceptors(LocalizationInterceptor)
	.addErrorHandlers(ErrorHandler)
	.withCustomUserAgent('sample/basic-fact/v2')
	.lambda()

// TODO: Replace this data with your own.
// It is organized by language/locale.  You can safely ignore the locales you aren't using.
// Update the name and messages to align with the theme of your skill

const ptbrData = {
	translation: {
		SKILL_NAME: 'Pokefacts'
	}
}

const ptData = {
	translation: {
		SKILL_NAME: 'Pokefacts',
		GET_FACT_MESSAGE: 'Aqui vai um fato sobre Pokémon: ',
		HELP_MESSAGE:
			'Você pode me perguntar por um fato interessante sobre o espaço, ou, fechar a skill. Como posso ajudar?',
		HELP_REPROMPT: 'O que vai ser?',
		FALLBACK_MESSAGE:
			'A skill fatos espaciais não tem uma resposta para isso. Ela pode contar informações interessantes sobre o espaço, é só perguntar. Como posso ajudar?',
		FALLBACK_REPROMPT:
			'Eu posso contar fatos sobre o espaço. Como posso ajudar?',
		ERROR_MESSAGE: 'Desculpa, algo deu errado.',
		STOP_MESSAGE: 'Tchau!',
		FACTS: [
			'Um ano em Mercúrio só dura 88 dias.',
			'Apesar de ser mais distante do sol, Venus é mais quente que Mercúrio.',
			'Visto de marte, o sol parece ser metade to tamanho que nós vemos da terra.',
			'Júpiter tem os dias mais curtos entre os planetas no nosso sistema solar.',
			'O sol é quase uma esfera perfeita.'
		]
	}
}

// constructs i18n and l10n data structure
const languageStrings = {
	pt: ptData,
	'pt-BR': ptbrData
}
