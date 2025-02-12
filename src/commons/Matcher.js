/**
 * Matcher module.
 * @module Matcher
 * @see module:Matcher
 */

const matched = (value) => ({
    on: () => matched(value),
    otherwise: () => value,
});

/**
 * This pattern will replace switch-case with a functionnal pattern (switch as expression)
 * <pre>
 * Example :
 const title = Matcher()
 .on(() => words && isEncaissement, () => words[Dico.KEYS.ENCAISSEMENT_PAGE_TITLE])
 .on(() => words && isPaiement, () => words[Dico.KEYS.LISTE_PAIEMENT_PAGE_TITLE])
 .on(() => words && isImpayes, () => words[Dico.KEYS.IMPAYES_PAGE_TITLE])
 .otherwise(() => '');
 * </pre>
 * @typedef {function(...*): unknown} FunctionVariadic
 * @typedef {object} MatcherReturnType
 * @property {function(FunctionVariadic, FunctionVariadic): MatcherReturnType} on (like case instruction)
 * @property {function(FunctionVariadic): unknown} otherwise (like default case)
 * @param {*} value - Value to switch with
 * @return {MatcherReturnType}
 */
const Matcher = (value = null) => ({
    on: (predicat, fn) => (predicat(value) ? matched(fn(value)) : Matcher(value)),
    otherwise: (fn) => fn(value),
});

export default Matcher;
