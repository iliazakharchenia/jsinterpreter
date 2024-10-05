function test_single_set_string_parse() {
    console.log("---> " + test_single_set_string_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("    var      x   =  1 ;"));
    console.log("---");
}

function test_multiple_set_and_return_string_parse() {
    console.log("---> " + test_multiple_set_and_return_string_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("    var      x   =  0 ;"));
    console.log(bli.parseString("       return            x       ;"));
    console.log("---");
}

function test_multiple_set_and_function_use_then_return_string_with_not_function_call_parse() {
    console.log("---> " + test_multiple_set_and_function_use_then_return_string_with_not_function_call_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("var x = 0 ;"));
    console.log(bli.parseString("var y = 0 ;"));
    console.log(bli.parseString("set y = not x ;"));
    console.log(bli.parseString("return y ;"));
    console.log("---");
}

function test_multiple_set_and_function_use_then_return_string_with_and_function_call_parse() {
    console.log("---> " + test_multiple_set_and_function_use_then_return_string_with_and_function_call_parse.name);
    const bli = new BinaryLanguageInterpreter();
    console.log(bli.parseString("var x = 0 ;"));
    console.log(bli.parseString("var y = 0 ;"));
    console.log(bli.parseString("set y = and x 1 1 ;"));
    console.log(bli.parseString("return y ;"));
    console.log("---");
}

test_single_set_string_parse();
test_multiple_set_and_return_string_parse();
test_multiple_set_and_function_use_then_return_string_with_not_function_call_parse();
test_multiple_set_and_function_use_then_return_string_with_and_function_call_parse();
