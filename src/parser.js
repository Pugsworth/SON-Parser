// Compare two arrays and return which items don't match.
function diffArray(arr1, arr2) {
    let report = [];

    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] != arr2[i]) {
            report.push({
                index: i,
                value_one: arr1[i],
                value_two: arr2[i]
            });
        }
    }

    return report;
}


function parseSON(sonString)
{
    let index = 0;

    function tokenize() {
        // These are for matching single characters at a time.
        const REGEX_SPECIAL     = /[{}[\]()=,]/; // Any special characters used in SON.
        const REGEX_STRING      = /"/; // Matches quoted strings. TODO: Only handles double quotes...
        const REGEX_NUMBER      = /[\-0-9]/; // Matches any number or negative sign. I'm sure this isn't the best way to do this...
        const REGEX_DIGIT       = /[0-9\.]/; // Matches any number or decimal point.
        const REGEX_WORD        = /[^\s=,{}[\]"]/; // Any character that isn't whitespace or a special character. TODO: Change the check to use REGEX_SPECIAL maybe?
        const REGEX_WHITESPACE  = /\s/; // Any whitespace character
        const REGEX_ANY         = /./;  // Any character
        const REGEX_ESC         = /\\/; // Escape character

        // Return next() without consuming it.
        function next() {
            return sonString[index];
        }

        // Return the next character in the string without consuming it.
        function peek() {
            return sonString[index+1];
        }

        // Return the previous character in the string without consuming it.
        function prev() {
            return sonString[index-1];
        }

        // Return next() and then increment index
        function consume() {
            return sonString[index++];
        }

        function skipWhitespace()
        {
            while (index < sonString.length && REGEX_WHITESPACE.test(next())) {
                consume();
            }
        }

        const tokens = [];
        let handled = false; // This is a hack to determine if the next() character was handled by a function.

        function add(value) {
            tokens.push(value);
            handled = true;
        }

        while (index < sonString.length) {
            skipWhitespace();

            handled = false;

            // Special characters
            if (REGEX_SPECIAL.test(next())) {
                add(consume());
                continue;
            }

            // Handle strings
            // TODO: This doesn't handle escaped or nested quotes.
            // TODO: This should actually just keep the quotes so the parser can handle strings separately from numbers.
            if (REGEX_STRING.test(next())) {
                consume(); // Move past the '"'
                let string = ""; // Store the string so far if needed.
                let start = index;
                while (index < sonString.length && !REGEX_STRING.test(next())) {
                    // We're escaping something!
                    if (next() == "\\") {
                        // To skip the escape character and consume the next character literally, we need to splice the string where we are and set start to the next index.
                        string += sonString.slice(start, index);
                        start = index+1;
                        consume();
                    }
                    consume();
                }
                string += sonString.slice(start, index);
                add(string);
                consume(); // Move past the '"'
                continue;
            }

            // Handle numbers
            // This one requires a bit more thought into how to match a number in the different notations.
            // There's integer, float, negative integer, negative float, scientific notation, hexicedimal, octal, binary, etc.
            // Since, for example, '-' for a negative numnber could also be a word/key, we need to peek ahead to see if it's a number or not.
            if (REGEX_NUMBER.test(next())) {
                // This number is a float if it has a decimal point.
                // TODO: Doesn't handle other notation and invalid numbers e.g. 1.2.3
                //                                                              ↳ should be a string instead?
                let decimal = false;

                const start = index;
                consume(); // Consume after number check so we can peek ahead.
                while (index < sonString.length && REGEX_DIGIT.test(next())) {
                    if (!decimal && next() === '.') {
                        decimal = true;
                    }
                    consume();
                }
                const slice = sonString.slice(start, index);

                let number;
                if (decimal) {
                    number = parseFloat(slice);
                }
                else {
                    number = parseInt(slice);
                }
                add(number);

                continue;
            }

            // Handle words
            if (REGEX_WORD.test(next())) {
                const start = index;
                while (index < sonString.length && REGEX_WORD.test(next())) {
                    index++;
                }
                add(sonString.slice(start, index));
                continue;
            }

            if (!handled) {
                throw new Error(`Unexpected character: '${next()}' after '${prev()}' at column ${index}`);
            }
        }

        // Rewind to now use the tokens for parsing.
        index = 0;

        return tokens;
    }

    // Now parse the tokens into a JSON object.
    function parse(tokens) {
        index = 0;

        let parsed = {};

        function prev() {
            return tokens[index-1];
        }

        function next() {
            return tokens[index];
        }

        function peek() {
            return tokens[index+1];
        }

        function consume() {
            return tokens[index++];
        }

        function expect(token) {
            if (consume() !== token) {
                throw new Error(`Expected '${token}' but got '${prev()}'`);
            }
        }

        function parseObject()
        {
            const obj = {};

            expect('{');
            while (index < tokens.length) {
                // Empty object.
                if (next() === '}') {
                    break;
                }

                const key = parseKey();
                expect('=');
                const value = parseValue();

                obj[key] = value;

                // There can only be a comma after a value.
                if (next() !== ',') {
                    break;
                }

                expect(',');
            }
            expect('}');

            return obj;
        }

        // An array is just a list of values. It can contain strings, numbers, arrays, or objects.
        function parseArray()
        {
            const arr = [];

            expect('[');
            while (index < tokens.length) {
                // Empty array.
                if (next() === ']') {
                    break;
                }

                const value = parseValue();
                arr.push(value);

                // There can only be a comma after a value.
                if (next() !== ',') {
                    break;
                }

                expect(',');
            }
            expect(']');

            return arr;
        }

        // A key is just a word or a string.
        function parseKey()
        {
            // TODO: Wanted to use REGEX_NUMBER, but that exists within the tokenizer. How could I detect numbers here?
            // Tries to detect any non-quoted strings that don't start with a number.
            if (/^\d/.test(next())) {
                throw new Error(`Invalid key: '${next()}'`);
            }

            return consume();
        }

        // A value can be a string, number, array, or object.
        function parseValue()
        {
            if (next() === '{') {
                return parseObject();
            }

            if (next() === '[') {
                return parseArray();
            }

            return consume();
        }

        parsed = parseObject();
        return parsed;
    }

    const tokens = tokenize();
    console.log("\tTokens: " + JSON.stringify(tokens));
    return parse(tokens);
}
