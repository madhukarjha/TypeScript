/// <reference path="fourslash.ts" />

// repro notes:
// Must have an interpolation appearing somewhere prior
// Must have a newline inside the error template
// Must have something following it

////`${1}`;
////`
////`;/**/1

goTo.marker();
edit.insert('\n');
verify.quickInfoIs("");

/*
BREAKPOINTS

    formatting.ts:
        71 (start of formatOnEnter)
        608 (tokenINfo = formattingScanner.readTokenInfo(...), in processChildNode)
        323 (start of formatSpan)

    checker.ts:
        1: good time to run `Object.assign(window, ts); window.sk = node => SyntaxKind[node.kind]`


NOTES

Indices:
     0 `
     1 $
     2 {
     3 1
     4 }
     5 `
     6 ;
     7 \n
     8 `
     9 \n
    10 `
    11 ;
    12 (insert here)
    13 1


NOTES

formatOnEnter:
    position = 13
    line = 1
    endOfFormatSpan = 13
    span = 10--14 (previous line to end+1)

formatSpan:
    enclosingNode is just the source file
    so getScanStartPosition() is the source file's stat


    Call formattingScanner.advance():
        isStarted = false, so scanner.scan()
        It's a backtick, so we scan a TemplateHead (with no content)

    Then we processNode(sourceFile, sourceFile, 0, 0, 0, 0)
        This calls processChildNodes(sourceFile children, sourceFile, 0, object)
            This calls processChildNode(child, 0, sourceFile, ...) for each child
            1st child (1st template ExpressionStatement):
                !rangeOVerlapsWithStartEnd, so returns inheritedIndentation
            2nd child (2nd template ExpressionStatement):
                formattingScanner.readTokenInfo(n)
                    !!! PROBLEM: readTokenInfo checks the SyntaxKind of `n` to correspond to token kinds.
                        But nodes never have token kinds...
                    n = SourceFile (why????)
                    So expectedScanAction is always ScanAction.scan

                    fixTokenKind also looks at the `container`, which is always SourceFile, and asks if isToken(container)

                Since we're not up to the child yet, we consumeTokenAndAdvanceScanner
                    Calls formattingScanner.advance(): since we're on a NumericLiteral, which is not trivia, don't advance

                Then we readTokenInfo(n) again:
                    expectedScanAction is still ScanAction.Scan
                    So we call scanner.scan(), *not knowing* that we're in a template
                    So we get a CloseBrace token
                Then processChildNode calls consumeTokenAndAdvanceScanner
                    Which blindly calls advance(), but since we're still on a `}` and that's not trivia, it doesn't advance yet
                But then we readTokenInfo(n) yet again:
                    `n` is still the SourceFile
                    So we call scanner.scan() again
                    Which sees "`" and interprets that as the *start* of a template, and calls scanTemplateAndSetTokenValue,
                        which eats up everything until the next "`"...
*/
