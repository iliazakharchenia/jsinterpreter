const INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH = -1;
const NOT_CONTAINS = -1;
const DEFAULT_PARSE_STRING = '';
const LETTERS_ONLY_PATTERN = /^[A-Za-z]+$/;
const TRUE_STRING = '1';
const FALSE_STRING = '0';
const SETTING_STRING = '=';
const STRINGS_DEVIDER = '\n';

class BinaryLanguageInterpreter {
    // functions
    #functions;

    // custom functions wrapped in objects
    #wrappedFunctions = new Map();

    // first layer
    #firstLayerKeywords;

    // variables
    #variables;

    #isExecuted = false;

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
        let wrappedFunctionName;

        // parse function name
        while (i < length) {
            if (this.#functions.has(arr[i])) {
                functionReference = this.#functions.get(arr[i]);
                i++;
                break;
            } else {
                // create a function reference object if function is wrapped into the object
                if (this.#wrappedFunctions.has(arr[i])) {
                    wrappedFunctionName = arr[i];
                    functionReference = [
                        this.#wrappedFunctions.get(wrappedFunctionName)[0], 
                        (args) => {
                            return this.#wrappedFunctions.get(wrappedFunctionName)[1].execute(...args);
                        }
                    ];
                    i++;
                    break;
                }
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
            throw new Error("Arguments set quantity of the called function is different then provided! Provided: "
                +argumentsSetLength+", actual: "+argumentsArray.length);

        // execute function and return result
        if (argumentsSetLength === 1) return functionReference[1](argumentsArray[0]);
        else if (argumentsSetLength > 1 || argumentsSetLength === INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH) 
            return functionReference[1](argumentsArray);

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

    isTerminated() {
        return this.#isExecuted.valueOf();
    }

    parseString(str) {
        if (this.#isExecuted) throw new Error("This interpreter is terminated!");

        const arr = str.split(' ');
        const firstLayerTuple = this.#parseFirstLayer(arr);

        // debugger;

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

                // cancelling of execution of that current interpreter
                this.#isExecuted = true;

                break;
        
            default:
                throw new Error("Unsupported operation!");

                break;
        }

        return [str, thirdLayerValue];
    }

    constructor(startVariablesSet, startCustomFunctionsSet) {
        this.#firstLayerKeywords = new Set(["var", "return", "set"]);
        this.#functions = new Map([
            ["and", [INFINITE_ARGUMENTS_FUNCTION_ARGUMENTS_LENGTH, andFunction]], 
            ["not", [1, notFunction]]
        ]);
        this.#variables = new Map();
        if (startVariablesSet instanceof Set) {
            for (const variable of startVariablesSet) {
                this.#variables.set(variable[0], variable[1]);
            }
        }
        if (startCustomFunctionsSet instanceof Set) {
            for (const func of startCustomFunctionsSet) {
                if (!this.#functions.has(func[0])) {
                    // if func is function wrapper type
                    if (typeof func[1][1] === 'object') {
                        this.#wrappedFunctions.set(func[0], func[1]);
                    } else this.#functions.set(func[0], func[1]);
                }
                else throw new Error("This interpreter is already have function with such name!");
            }
        }
    }
}

class CustomBooleanFunctionWrapper {

    #arguments;

    #function;

    #functionName;

    #functionExecutionInterpreter;

    #functionValidationInterpreter;

    #stringsOfCodeToInterprete = [];

    #isReadyToExecute = false;

    #setValuesToArguments(...values) {
        if (values.length !== this.#arguments.size) throw new Error("Arguments set size is different!");

        let i = 0;
        for (const elem of this.#arguments) {
            elem[1] = values[i];
            i++;
        }
    }

    canBeExecuted() {
        return this.#isReadyToExecute.valueOf();
    }

    execute(...values) {
        if (!this.canBeExecuted()) throw new Error("Execution is not ready!");
        if (values.length !== this.#arguments.size) throw new Error("Arguments set size is different!");

        this.#setValuesToArguments(...values);
        this.#functionExecutionInterpreter = new BinaryLanguageInterpreter(this.#arguments);

        // interprete all strings
        let i = 0;
        let length = this.#stringsOfCodeToInterprete.length;
        let result;
        while (i < length) {
            result = this.#functionExecutionInterpreter.parseString(this.#stringsOfCodeToInterprete[i]);
            i++;
        }

        return result[1];
    }

    parse(stringsToParse) {
        if (this.canBeExecuted()) throw new Error("Function is ready for execution! Don't change it!");
        if (!Array.isArray(stringsToParse)) throw new Error("Strings to parse a function is not an array!");

        const arr = stringsToParse[0].split(' ');
        let i = 0;
        const length = arr.length;

        // parse 'function' keyword
        let isKeyWordParsed = false;
        while (i < length) {
            if (arr[i] === 'function') {
                isKeyWordParsed = true;
                i++;
                break;
            }
            i++;
        }
        if (!isKeyWordParsed) throw new Error("Function 'function' keyword is not exists!");

        // parse function name
        while (i < length) {
            if (arr[i].match(LETTERS_ONLY_PATTERN)) {
                this.#functionName = arr[i];
                i++;
                break;
            }
            i++;
        }

        // parse function from arguments string separator
        let isSeparatorParsed = false;
        while (i < length) {
            if (arr[i] === ':') {
                isSeparatorParsed = true;
                i++;
                break;
            }
            i++;
        }
        if (!isSeparatorParsed) throw new Error("Function name declaration is not separated by ':' separator symbol from the arguments!");

        // parse function arguments names
        isSeparatorParsed = false;
        while (i < length) {
            if (arr[i].match(LETTERS_ONLY_PATTERN) && !this.#arguments.has([arr[i], FALSE_STRING])) {
                this.#arguments.add([arr[i], FALSE_STRING]);
            }
            else if (arr[i] !== DEFAULT_PARSE_STRING) {
                if (arr[i] === '=') {
                    break;
                }
                throw new Error("Function parsing problem: non valid argument name! Argument name: '"+arr[i]+"'.");
            }
            i++;
        }

        // parse function from body separator
        isSeparatorParsed = false;
        while (i < length) {
            if (arr[i] === '=') {
                i++;
                isSeparatorParsed = true;
                break;
            }
            i++;
        }
        if (!isSeparatorParsed) throw new Error("Function arguments declaration is not separated by '=' separator symbol from the body!");

        // create and return function object after validations
        this.#functionValidationInterpreter = new BinaryLanguageInterpreter(this.#arguments);
        let stringNum = 1;
        let stringsArrayLength = stringsToParse.length;
        while (stringNum < stringsArrayLength) {
            try {
                this.#functionValidationInterpreter.parseString(stringsToParse[stringNum]);
            } catch (error) {
                throw new Error("Function parsing failed! Trace: \nfunction name -> "+
                    this.#functionName+" , \nfunction arguments -> "+this.#arguments+" , \nreason -> "+error);
            }
            this.#stringsOfCodeToInterprete.push(stringsToParse[stringNum]);
            stringNum++;
        }
        this.#isReadyToExecute = true;

        this.#function = [this.#functionName, [this.#arguments.size, this]];

        return this.#function;
    }

    constructor() {
        this.#arguments = new Set();
    }
}

class CodeReceiver {

    #functionsStringArrays = [];

    #codeForInterpreter = [];

    #mainInterpreter;

    #parseFirstKeyword(string) {
        const words = string.split(" ");

        const length = words.length;
        let i = 0;

        while (i < length) {
            const word = words[i];
            if (word === "var" || word === "set" || word === "return" || word === "function") {
                return word;
            }
            i++;
        }

        throw new Error("String is not contains any first layer keywords or is not empty!");
    }
    
    execute() {
        if (this.#mainInterpreter.isTerminated()) return new Error("Main interpreter is terminated");

        let result;
        this.#codeForInterpreter.forEach(codeString => {
            result = this.#mainInterpreter.parseString(codeString);
        });

        return result[1];
    }

    constructor(code) {
        const allStrings = code.split(STRINGS_DEVIDER);
        let i = 0;
        let length = allStrings.length;

        // debugger;

        // devide all strings into functions strings and code for interpreter
        while (i < length) {
            if (allStrings[i] === DEFAULT_PARSE_STRING) {
                i++;
                continue;
            }

            const word = this.#parseFirstKeyword(allStrings[i]);

            // parse function strings
            if (word === "function") {
                this.#functionsStringArrays.push([]);

                // fetch function strings
                while (i < length) {
                    const functionWord = this.#parseFirstKeyword(allStrings[i]);

                    if (functionWord === "return") {
                        this.#functionsStringArrays[this.#functionsStringArrays.length-1].push(allStrings[i]);
                        i++;
                        break;
                    } else {
                        this.#functionsStringArrays[this.#functionsStringArrays.length-1].push(allStrings[i]);
                        i++;
                    }
                }
            }
            else {
                // parse interpreter strings
                this.#codeForInterpreter.push(allStrings[i]);
                i++;
            }
        }

        // functions set creation and setting
        let functionsSet = new Set();
        length = this.#functionsStringArrays.length;
        for (let index = 0; index < length; index++) {
            const functionStrings = this.#functionsStringArrays[index];
            functionsSet.add((new CustomBooleanFunctionWrapper()).parse(functionStrings));
        }

        // main interpreter creation
        this.#mainInterpreter = new BinaryLanguageInterpreter(null, functionsSet);
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
