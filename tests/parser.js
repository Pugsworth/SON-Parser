/////////////////
//    Tests    //
/////////////////

const tests = [
// - Example
    [ '{Name=[1, 2, 3], Another={NameAgain="text"}}',           {"Name": [1, 2, 3], "Another": {"NameAgain": "text"}},      "Example" ],
// - Empty objects
    [ '{"Test"= {}}',                                           {"Test": {}},                                               "Empty object" ],
// - Empty arrays
    [ '{"Test"= []}',                                           {"Test": []},                                               "Empty array" ],
// - Nested objects
    [ '{"Test"= {"Nested"= {}}}',                               {"Test": {"Nested": {}}},                                   "Nested object" ],
// - Nested arrays
    [ '{"Test"= [[], []]}',                                     {"Test": [[], []]},                                         "Nested array" ],
// - Empty strings
    [ '{"Test"= ""}',                                           {"Test": ""},                                               "Empty string" ],
// - Strings with escaped quotes
    [ '{"Test"= "\\""}',                                        {"Test": "\""},                                             "Escaped quote" ],
// - Strings with nested quotes
    [ '{"Test"= "This is a \\"nested\\" quote"}',               {"Test": "This is a \"nested\" quote"},                     "Nested quote" ],
// - Numbers with decimals
    [ '{"Test"= 1.5}',                                          {"Test": 1.5},                                              "Decimal number" ],
// - Numbers with negative signs
    [ '{"Test"= -1}',                                           {"Test": -1},                                               "Negative number" ],
    [ '{"Test"= -1.5}',                                         {"Test": -1.5},                                             "Negative decimal number" ],
// - Trailing commas
    [ '{"Test"= 1,}',                                           {"Test": 1},                                                "Trailing comma" ],
    [ '{"Test"= [1, 2, 3,], "Key2"= {"Inner"= [1, 2, 3,]},}',   {"Test": [1, 2, 3], "Key2": {"Inner": [1, 2, 3]}},          "Trailing comma" ],
// - Invalid SON
    [ '{"Test"= [1 test]}',                                     null,                                                       "Invalid: No comma between items" ], // No comma between array elements
    [ '{"Test"= [1, 2, 3,}',                                    null,                                                       "Invalid: Unclosed array" ], // Unclosed array
    [ '{42= 42}',                                               null,                                                       "Invalid: Keys cannot begin with numbers" ], // Invalid key
    [ '{"Test"= [1, 2, 3,], "Key2": {"Inner"= [1, 2, 3,]},}',   null,                                                       "Only '=' denotes key/value pairs" ], // Using ':' instead of '='
]

RunTests(tests);
