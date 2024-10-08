function test_single_set_string_parse() {
    console.log("---> " + test_single_set_string_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("    var      x   =  1 "));
    console.log("---");
}

function test_multiple_set_and_return_string_parse() {
    console.log("---> " + test_multiple_set_and_return_string_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("    var      x   =  0 "));
    console.log(bli.parseString("       return            x       "));
    console.log("---");
}

function test_multiple_set_and_function_use_then_return_string_with_not_function_call_parse() {
    console.log("---> " + test_multiple_set_and_function_use_then_return_string_with_not_function_call_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("var x = 0 "));
    console.log(bli.parseString("var y = 0 "));
    console.log(bli.parseString("set y = not x "));
    console.log(bli.parseString("return y "));
    console.log("---");
}

function test_multiple_set_and_function_use_then_return_string_with_and_function_call_parse() {
    console.log("---> " + test_multiple_set_and_function_use_then_return_string_with_and_function_call_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("var x = 0 "));
    console.log(bli.parseString("var y = 0 "));
    console.log(bli.parseString("set y = and x 1 1 "));
    console.log(bli.parseString("return y "));
    console.log("---");
}

function or_procedure_test() {
    console.log("---> " + or_procedure_test.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("var x = 0"));
    console.log(bli.parseString("var y = 1"));
    console.log(bli.parseString("var ans = 0"));
    console.log(bli.parseString("set x = not x"));
    console.log(bli.parseString("set y = not y"));
    console.log(bli.parseString("set ans = and x y"));
    console.log(bli.parseString("set ans = not ans"));
    console.log(bli.parseString("return ans"));
    console.log("---");
}

function functionTest() {
    console.log("---> " + functionTest.name);
    let stringsToParse = [];
    console.log(stringsToParse[stringsToParse.push("function twoOr : a b =")-1]);
    console.log(stringsToParse[stringsToParse.push("var x = 0")-1]);
    console.log(stringsToParse[stringsToParse.push("var y = 0")-1]);
    console.log(stringsToParse[stringsToParse.push("var ans = 0")-1]);
    console.log(stringsToParse[stringsToParse.push("set x = not a")-1]);
    console.log(stringsToParse[stringsToParse.push("set y = not b")-1]);
    console.log(stringsToParse[stringsToParse.push("set ans = and x y")-1]);
    console.log(stringsToParse[stringsToParse.push("set ans = not ans")-1]);
    console.log(stringsToParse[stringsToParse.push("return ans")-1]);
    let fw = new CustomBooleanFunctionWrapper();
    fw.parse(stringsToParse);

    console.log("tests: ");
    console.log("0 0 -> "+fw.execute('0', '0')[1]);
    console.log("0 1 -> "+fw.execute('0', '1')[1]);
    console.log("1 0 -> "+fw.execute('1', '0')[1]);
    console.log("1 1 -> "+fw.execute('1', '1')[1]);
    console.log("---");
}

function code_parser_test() {
    console.log("---> code_parser_test");
    let code = "";

    code = code.concat("function twoNand : a b =\n");
    code = code.concat("var x = 0\n");
    code = code.concat("var y = 0\n");
    code = code.concat("var ans = 0\n");
    code = code.concat("set ans = and a b\n");
    code = code.concat("set ans = not ans\n");
    code = code.concat("return ans\n");

    code = code.concat("\n");

    code = code.concat("function twoOr : a b =\n");
    code = code.concat("var x = 0\n");
    code = code.concat("var y = 0\n");
    code = code.concat("var ans = 0\n");
    code = code.concat("set x = not a\n");
    code = code.concat("set y = not b\n");
    code = code.concat("set ans = and x y\n");
    code = code.concat("set ans = not ans\n");
    code = code.concat("return ans\n");

    code = code.concat("\n");

    code = code.concat("var x = 1\n");
    code = code.concat("var y = 0\n");
    code = code.concat("var ans = 0\n");
    code = code.concat("set ans = twoNand x y\n");
    code = code.concat("set ans = twoOr ans ans\n");
    code = code.concat("return ans\n");

    console.log(code);
    let cr = new CodeReceiver(code);
    // console.log(cr);
    console.log("test: ");
    console.log(cr.execute());

    console.log("---");
}

test_single_set_string_parse();
test_multiple_set_and_return_string_parse();
test_multiple_set_and_function_use_then_return_string_with_not_function_call_parse();
test_multiple_set_and_function_use_then_return_string_with_and_function_call_parse();
or_procedure_test();
functionTest();
code_parser_test();
