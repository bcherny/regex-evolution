linear regression: have points, need to find equation to best fit them
regex: have strings, need to find regex to best fit them

generally, there is an atom, and an abstraction that can (a) validate
a given novel atom, and (b) be used to generate new atoms.

Q: can we only generate over continuous domains, or does it also work for discrete values?

atom              abstraction over atoms
----              ----------------------
number            regression
string            regex
(thing1, thing2)  category (eg. red and green are colors)
x => y

------------------------

problem: effectiveness of a given regex is non-linear. eg. ^\w+@\w+com$ will match no emails, but if you add a "." (ie. ^\w+@\w+\.com$), it will match very well. is there a way to quantify how good of a match a given regex is, so we can optimize a linear quantity instead of this non-linear one? this is analogous to the evolutionary argument that "eyes are not useful until they are fully functional".

  solution 1: evaluate the regex against sub-expressions of each test string, starting with the 1st character of each string, and adding one character at a time, to generate a composite score.

  solution 2: separate evolution into 2 phases. in the first, don't penalize long regexes, in the hope that some of their parts will eventually (and non linearly) become functional. once a solution is good, start a "famine" pruning phase, where there is pressure to condense the regex into its shortest possible form.

-----------------------

idea: explore regex search space more methodically - how many possible regexes are there? If it's workable to make this a high-dimensional optimization problem, where we need to graph each letter of a possible solution:

- assign a scalar 0-25 to each letter of the alphabet
- assign a scalar 26-35 to each useful symbol (!, @, #, ...)
- assign a scalar 35-39 to each special keyword (\d, \w, \s, \b)
- for each letter of the alphabet, assign each slot of the word to a sequentially increasing dimension

for example:

say regex is "^\w@\w\\.com$". we would assign

x = 31 (^)
y = 36 (\w)
z = 27 (@)
za = 36 (\w)
...

it would then become a problem of optimizing along these axes to find the globally optimal solution. this is a well explored problem space, and could be solved with high dimensional gradient descent.

Q: what are the odds of finding a good solution? how large is the search space - how long will it take to find a good solution? it's possible that the search space is too large, and we would need to give the progam a knowedge of regex grammar (and maybe even semantics? would that make this an expert system?). it would be nice for the program to learn grammar itself, so we don't have to hardcode it.

TODO: find a good js or scala lib for this



------------------

The uncanny thing is that while DNA is split and combined, it still results in valid programs most of the time, and only only a small number of genes are mutated in the end! If you take the average computer program's source code and combine it with another program that has the same functionality, the resulting program will certainly not run.

Source code is too delicate to merge this way, but somehow, DNA manages to encode its programming in a way as to enable large scale merging. How are programs represented in DNA?

Q: Do a lot of DNA sequences code for merging machinery (ie. devops DNA)?
A: Probably not, if DNA is anything like a Chromebook. There is some code for merging, but it is probably outweighed by code for writing, error handling, etc.

Same for regexes as a specific type of program: Regexes A and B combined randomly will likely yield a nonsense result.

-----------------

Idea: Can reduce dimensionality by combining axes. Eg. if axis A ranges from 0-50, and axis B ranges from 0-30, then they can be combined into axis A1 which ranges from 0-150.