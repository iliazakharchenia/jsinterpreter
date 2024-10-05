const INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH = -1;
const NOT_CONTAINS = -1;
const DEFAULT_PARSE_STRING = '';
const LETTERS_ONLY_PATTERN = /^[A-Za-z]+$/;
const TRUE_STRING = '1';
const FALSE_STRING = '0';
const SETTING_STRING = '=';

class BinaryLanguageInterpreter {
    // functions
    #functions;

    // first layer
    #firstLayerKeywords;

    // variables
    #variables;

    #parseFirstLayer(arr) {
        let i = 0;
        const length = arr.length;
        while (i < length) {
            if (this.#firstLayerKeywords.has(arr[i])) return [i+1, arr[i]];
            i++;
        }

        throw new Error("First layer keywords is not accessible!");
    }

    #parseSecondLayer(from, arr) {
        let i = from;
        const length = arr.length;

        //debugger;

        while (i < length) {
            if (!this.#firstLayerKeywords.has(arr[i]) && arr[i].match(LETTERS_ONLY_PATTERN)) return [i+1, arr[i]];
            i++;
        }

        throw new Error("Second layer is empty!");
    }

    #parseFunctionCall(from, arr) {
        let i = from;
        const length = arr.length;
        let argumentsArray = [];
        let functionReference;

        // parse function name
        while (i < length) {
            if (this.#functions.has(arr[i])) {
                functionReference = this.#functions.get(arr[i]);
                i++;
                break;
            }
            i++;
        }

        // parse function arguments
        let argumentsSetLength = functionReference[0];
        while (i < length) {
            if (arr[i] === TRUE_STRING || arr[i] === FALSE_STRING) {
                argumentsArray.push(arr[i]);
            }
            if (this.#variables.has(arr[i])) {
                argumentsArray.push(this.#variables.get(arr[i]));
            }
            i++;
        }
        if (argumentsSetLength !== argumentsArray.length 
            && argumentsSetLength !== INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH) 
            throw new Error("Arguments set quantity of the called function is different then provided!");

        // execute function and return result
        if (argumentsSetLength === 1) return functionReference[1](argumentsArray[0]);
        else if (argumentsSetLength > 1 || argumentsSetLength === INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH) return functionReference[1](argumentsArray);

        throw new Error("Function call is empty!");
    }

    #parseThirdLayer(from, arr, toReturn, toParseFunctionCall) {
        let i = from;
        const length = arr.length;

        //debugger;

        if (toReturn === true) { 
            while (i < length) {
                if (!this.#firstLayerKeywords.has(arr[i]) 
                    && arr[i] !== SETTING_STRING 
                    && this.#variables.has(arr[i])
                ) {
                    return this.#variables.get(arr[i]);
                }
                i++;
            }
        }

        while (i < length) {
            if (!this.#firstLayerKeywords.has(arr[i]) && arr[i] === SETTING_STRING) {
                i++;
                break;
            }
            i++;
        }

        if (toParseFunctionCall === true) {
            let functionCallReturn = this.#parseFunctionCall(i, arr);
            return functionCallReturn;
        }

        while (i < length) {
            if (arr[i] === TRUE_STRING || arr[i] === FALSE_STRING) return arr[i];
            i++;
        }

        throw new Error("Third layer is empty!");
    }

    parseString(str) {
        const arr = str.split(' ');
        const firstLayerTuple = this.#parseFirstLayer(arr);

        //debugger;

        let secondLayerTuple;
        let thirdLayerValue;
        switch (firstLayerTuple[1]) {

            // introducing variable
            case "var":
                secondLayerTuple = this.#parseSecondLayer(firstLayerTuple[0], arr);
                if (this.#functions.has(secondLayerTuple[1])) throw new Error("Functions names set contain such name!");
                if (this.#variables.has(secondLayerTuple[1])) throw new Error("Variables names set contain such name!");
                thirdLayerValue = this.#parseThirdLayer(secondLayerTuple[0], arr, false, false);
                this.#variables.set(secondLayerTuple[1], thirdLayerValue);

                break;
            
            // set variable
            case "set":
                secondLayerTuple = this.#parseSecondLayer(firstLayerTuple[0], arr);
                if (this.#functions.has(secondLayerTuple[1])) throw new Error("Functions names set contain such name!");
                if (!this.#variables.has(secondLayerTuple[1])) throw new Error("Variables names set not contain such name!");
                thirdLayerValue = this.#parseThirdLayer(secondLayerTuple[0], arr, false, true);
                this.#variables.set(secondLayerTuple[1], thirdLayerValue);

                break;
            
            // return variable
            case "return":
                thirdLayerValue = this.#parseThirdLayer(firstLayerTuple[0], arr, true);

                break;
        
            default:
                throw new Error("Unsupported operation!");

                break;
        }

        return [str, thirdLayerValue];
    }

    constructor() {
        this.#firstLayerKeywords = new Set(["var", "return", "set"]);
        this.#functions = new Map([
            ["and", [INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH, andFunction]], 
            ["not", [1, notFunction]]
        ]);
        this.#variables = new Map();
    }
}

function andFunction(arr) {
    let i = 0;
    const length = arr.length;
    while (i < length) {
        if (arr[i] === FALSE_STRING) return FALSE_STRING;
        i++;
    }

    return TRUE_STRING;
}

function notFunction(arg) {
    if (arg === TRUE_STRING) return FALSE_STRING;

    return TRUE_STRING;
}
