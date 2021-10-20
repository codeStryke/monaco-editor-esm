import { e as editor, R as Range$1, l as languages, a as MarkerSeverity, U as Uri } from "./index.js";
var STOP_WHEN_IDLE_FOR = 2 * 60 * 1e3;
var WorkerManager = function() {
  function WorkerManager2(defaults) {
    var _this = this;
    this._defaults = defaults;
    this._worker = null;
    this._idleCheckInterval = window.setInterval(function() {
      return _this._checkIfIdle();
    }, 30 * 1e3);
    this._lastUsedTime = 0;
    this._configChangeListener = this._defaults.onDidChange(function() {
      return _this._stopWorker();
    });
  }
  WorkerManager2.prototype._stopWorker = function() {
    if (this._worker) {
      this._worker.dispose();
      this._worker = null;
    }
    this._client = null;
  };
  WorkerManager2.prototype.dispose = function() {
    clearInterval(this._idleCheckInterval);
    this._configChangeListener.dispose();
    this._stopWorker();
  };
  WorkerManager2.prototype._checkIfIdle = function() {
    if (!this._worker) {
      return;
    }
    var timePassedSinceLastUsed = Date.now() - this._lastUsedTime;
    if (timePassedSinceLastUsed > STOP_WHEN_IDLE_FOR) {
      this._stopWorker();
    }
  };
  WorkerManager2.prototype._getClient = function() {
    this._lastUsedTime = Date.now();
    if (!this._client) {
      this._worker = editor.createWebWorker({
        moduleId: "vs/language/css/cssWorker",
        label: this._defaults.languageId,
        createData: {
          options: this._defaults.options,
          languageId: this._defaults.languageId
        }
      });
      this._client = this._worker.getProxy();
    }
    return this._client;
  };
  WorkerManager2.prototype.getLanguageServiceWorker = function() {
    var _this = this;
    var resources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      resources[_i] = arguments[_i];
    }
    var _client;
    return this._getClient().then(function(client) {
      _client = client;
    }).then(function(_) {
      return _this._worker.withSyncedResources(resources);
    }).then(function(_) {
      return _client;
    });
  };
  return WorkerManager2;
}();
var TokenType;
(function(TokenType2) {
  TokenType2[TokenType2["Ident"] = 0] = "Ident";
  TokenType2[TokenType2["AtKeyword"] = 1] = "AtKeyword";
  TokenType2[TokenType2["String"] = 2] = "String";
  TokenType2[TokenType2["BadString"] = 3] = "BadString";
  TokenType2[TokenType2["UnquotedString"] = 4] = "UnquotedString";
  TokenType2[TokenType2["Hash"] = 5] = "Hash";
  TokenType2[TokenType2["Num"] = 6] = "Num";
  TokenType2[TokenType2["Percentage"] = 7] = "Percentage";
  TokenType2[TokenType2["Dimension"] = 8] = "Dimension";
  TokenType2[TokenType2["UnicodeRange"] = 9] = "UnicodeRange";
  TokenType2[TokenType2["CDO"] = 10] = "CDO";
  TokenType2[TokenType2["CDC"] = 11] = "CDC";
  TokenType2[TokenType2["Colon"] = 12] = "Colon";
  TokenType2[TokenType2["SemiColon"] = 13] = "SemiColon";
  TokenType2[TokenType2["CurlyL"] = 14] = "CurlyL";
  TokenType2[TokenType2["CurlyR"] = 15] = "CurlyR";
  TokenType2[TokenType2["ParenthesisL"] = 16] = "ParenthesisL";
  TokenType2[TokenType2["ParenthesisR"] = 17] = "ParenthesisR";
  TokenType2[TokenType2["BracketL"] = 18] = "BracketL";
  TokenType2[TokenType2["BracketR"] = 19] = "BracketR";
  TokenType2[TokenType2["Whitespace"] = 20] = "Whitespace";
  TokenType2[TokenType2["Includes"] = 21] = "Includes";
  TokenType2[TokenType2["Dashmatch"] = 22] = "Dashmatch";
  TokenType2[TokenType2["SubstringOperator"] = 23] = "SubstringOperator";
  TokenType2[TokenType2["PrefixOperator"] = 24] = "PrefixOperator";
  TokenType2[TokenType2["SuffixOperator"] = 25] = "SuffixOperator";
  TokenType2[TokenType2["Delim"] = 26] = "Delim";
  TokenType2[TokenType2["EMS"] = 27] = "EMS";
  TokenType2[TokenType2["EXS"] = 28] = "EXS";
  TokenType2[TokenType2["Length"] = 29] = "Length";
  TokenType2[TokenType2["Angle"] = 30] = "Angle";
  TokenType2[TokenType2["Time"] = 31] = "Time";
  TokenType2[TokenType2["Freq"] = 32] = "Freq";
  TokenType2[TokenType2["Exclamation"] = 33] = "Exclamation";
  TokenType2[TokenType2["Resolution"] = 34] = "Resolution";
  TokenType2[TokenType2["Comma"] = 35] = "Comma";
  TokenType2[TokenType2["Charset"] = 36] = "Charset";
  TokenType2[TokenType2["EscapedJavaScript"] = 37] = "EscapedJavaScript";
  TokenType2[TokenType2["BadEscapedJavaScript"] = 38] = "BadEscapedJavaScript";
  TokenType2[TokenType2["Comment"] = 39] = "Comment";
  TokenType2[TokenType2["SingleLineComment"] = 40] = "SingleLineComment";
  TokenType2[TokenType2["EOF"] = 41] = "EOF";
  TokenType2[TokenType2["CustomToken"] = 42] = "CustomToken";
})(TokenType || (TokenType = {}));
var MultiLineStream = function() {
  function MultiLineStream2(source) {
    this.source = source;
    this.len = source.length;
    this.position = 0;
  }
  MultiLineStream2.prototype.substring = function(from, to) {
    if (to === void 0) {
      to = this.position;
    }
    return this.source.substring(from, to);
  };
  MultiLineStream2.prototype.eos = function() {
    return this.len <= this.position;
  };
  MultiLineStream2.prototype.pos = function() {
    return this.position;
  };
  MultiLineStream2.prototype.goBackTo = function(pos) {
    this.position = pos;
  };
  MultiLineStream2.prototype.goBack = function(n) {
    this.position -= n;
  };
  MultiLineStream2.prototype.advance = function(n) {
    this.position += n;
  };
  MultiLineStream2.prototype.nextChar = function() {
    return this.source.charCodeAt(this.position++) || 0;
  };
  MultiLineStream2.prototype.peekChar = function(n) {
    if (n === void 0) {
      n = 0;
    }
    return this.source.charCodeAt(this.position + n) || 0;
  };
  MultiLineStream2.prototype.lookbackChar = function(n) {
    if (n === void 0) {
      n = 0;
    }
    return this.source.charCodeAt(this.position - n) || 0;
  };
  MultiLineStream2.prototype.advanceIfChar = function(ch) {
    if (ch === this.source.charCodeAt(this.position)) {
      this.position++;
      return true;
    }
    return false;
  };
  MultiLineStream2.prototype.advanceIfChars = function(ch) {
    if (this.position + ch.length > this.source.length) {
      return false;
    }
    var i = 0;
    for (; i < ch.length; i++) {
      if (this.source.charCodeAt(this.position + i) !== ch[i]) {
        return false;
      }
    }
    this.advance(i);
    return true;
  };
  MultiLineStream2.prototype.advanceWhileChar = function(condition) {
    var posNow = this.position;
    while (this.position < this.len && condition(this.source.charCodeAt(this.position))) {
      this.position++;
    }
    return this.position - posNow;
  };
  return MultiLineStream2;
}();
var _a = "a".charCodeAt(0);
var _f = "f".charCodeAt(0);
var _z = "z".charCodeAt(0);
var _A = "A".charCodeAt(0);
var _F = "F".charCodeAt(0);
var _Z = "Z".charCodeAt(0);
var _0$1 = "0".charCodeAt(0);
var _9$1 = "9".charCodeAt(0);
var _TLD = "~".charCodeAt(0);
var _HAT = "^".charCodeAt(0);
var _EQS$1 = "=".charCodeAt(0);
var _PIP = "|".charCodeAt(0);
var _MIN = "-".charCodeAt(0);
var _USC = "_".charCodeAt(0);
var _PRC = "%".charCodeAt(0);
var _MUL = "*".charCodeAt(0);
var _LPA = "(".charCodeAt(0);
var _RPA = ")".charCodeAt(0);
var _LAN$1 = "<".charCodeAt(0);
var _RAN$1 = ">".charCodeAt(0);
var _ATS = "@".charCodeAt(0);
var _HSH$1 = "#".charCodeAt(0);
var _DLR$1 = "$".charCodeAt(0);
var _BSL = "\\".charCodeAt(0);
var _FSL$2 = "/".charCodeAt(0);
var _NWL$2 = "\n".charCodeAt(0);
var _CAR$2 = "\r".charCodeAt(0);
var _LFD$2 = "\f".charCodeAt(0);
var _DQO = '"'.charCodeAt(0);
var _SQO = "'".charCodeAt(0);
var _WSP = " ".charCodeAt(0);
var _TAB = "	".charCodeAt(0);
var _SEM = ";".charCodeAt(0);
var _COL = ":".charCodeAt(0);
var _CUL$1 = "{".charCodeAt(0);
var _CUR = "}".charCodeAt(0);
var _BRL = "[".charCodeAt(0);
var _BRR = "]".charCodeAt(0);
var _CMA = ",".charCodeAt(0);
var _DOT$2 = ".".charCodeAt(0);
var _BNG$1 = "!".charCodeAt(0);
var staticTokenTable = {};
staticTokenTable[_SEM] = TokenType.SemiColon;
staticTokenTable[_COL] = TokenType.Colon;
staticTokenTable[_CUL$1] = TokenType.CurlyL;
staticTokenTable[_CUR] = TokenType.CurlyR;
staticTokenTable[_BRR] = TokenType.BracketR;
staticTokenTable[_BRL] = TokenType.BracketL;
staticTokenTable[_LPA] = TokenType.ParenthesisL;
staticTokenTable[_RPA] = TokenType.ParenthesisR;
staticTokenTable[_CMA] = TokenType.Comma;
var staticUnitTable = {};
staticUnitTable["em"] = TokenType.EMS;
staticUnitTable["ex"] = TokenType.EXS;
staticUnitTable["px"] = TokenType.Length;
staticUnitTable["cm"] = TokenType.Length;
staticUnitTable["mm"] = TokenType.Length;
staticUnitTable["in"] = TokenType.Length;
staticUnitTable["pt"] = TokenType.Length;
staticUnitTable["pc"] = TokenType.Length;
staticUnitTable["deg"] = TokenType.Angle;
staticUnitTable["rad"] = TokenType.Angle;
staticUnitTable["grad"] = TokenType.Angle;
staticUnitTable["ms"] = TokenType.Time;
staticUnitTable["s"] = TokenType.Time;
staticUnitTable["hz"] = TokenType.Freq;
staticUnitTable["khz"] = TokenType.Freq;
staticUnitTable["%"] = TokenType.Percentage;
staticUnitTable["fr"] = TokenType.Percentage;
staticUnitTable["dpi"] = TokenType.Resolution;
staticUnitTable["dpcm"] = TokenType.Resolution;
var Scanner = function() {
  function Scanner2() {
    this.stream = new MultiLineStream("");
    this.ignoreComment = true;
    this.ignoreWhitespace = true;
    this.inURL = false;
  }
  Scanner2.prototype.setSource = function(input) {
    this.stream = new MultiLineStream(input);
  };
  Scanner2.prototype.finishToken = function(offset, type, text) {
    return {
      offset,
      len: this.stream.pos() - offset,
      type,
      text: text || this.stream.substring(offset)
    };
  };
  Scanner2.prototype.substring = function(offset, len) {
    return this.stream.substring(offset, offset + len);
  };
  Scanner2.prototype.pos = function() {
    return this.stream.pos();
  };
  Scanner2.prototype.goBackTo = function(pos) {
    this.stream.goBackTo(pos);
  };
  Scanner2.prototype.scanUnquotedString = function() {
    var offset = this.stream.pos();
    var content = [];
    if (this._unquotedString(content)) {
      return this.finishToken(offset, TokenType.UnquotedString, content.join(""));
    }
    return null;
  };
  Scanner2.prototype.scan = function() {
    var triviaToken = this.trivia();
    if (triviaToken !== null) {
      return triviaToken;
    }
    var offset = this.stream.pos();
    if (this.stream.eos()) {
      return this.finishToken(offset, TokenType.EOF);
    }
    return this.scanNext(offset);
  };
  Scanner2.prototype.scanNext = function(offset) {
    if (this.stream.advanceIfChars([_LAN$1, _BNG$1, _MIN, _MIN])) {
      return this.finishToken(offset, TokenType.CDO);
    }
    if (this.stream.advanceIfChars([_MIN, _MIN, _RAN$1])) {
      return this.finishToken(offset, TokenType.CDC);
    }
    var content = [];
    if (this.ident(content)) {
      return this.finishToken(offset, TokenType.Ident, content.join(""));
    }
    if (this.stream.advanceIfChar(_ATS)) {
      content = ["@"];
      if (this._name(content)) {
        var keywordText = content.join("");
        if (keywordText === "@charset") {
          return this.finishToken(offset, TokenType.Charset, keywordText);
        }
        return this.finishToken(offset, TokenType.AtKeyword, keywordText);
      } else {
        return this.finishToken(offset, TokenType.Delim);
      }
    }
    if (this.stream.advanceIfChar(_HSH$1)) {
      content = ["#"];
      if (this._name(content)) {
        return this.finishToken(offset, TokenType.Hash, content.join(""));
      } else {
        return this.finishToken(offset, TokenType.Delim);
      }
    }
    if (this.stream.advanceIfChar(_BNG$1)) {
      return this.finishToken(offset, TokenType.Exclamation);
    }
    if (this._number()) {
      var pos = this.stream.pos();
      content = [this.stream.substring(offset, pos)];
      if (this.stream.advanceIfChar(_PRC)) {
        return this.finishToken(offset, TokenType.Percentage);
      } else if (this.ident(content)) {
        var dim = this.stream.substring(pos).toLowerCase();
        var tokenType_1 = staticUnitTable[dim];
        if (typeof tokenType_1 !== "undefined") {
          return this.finishToken(offset, tokenType_1, content.join(""));
        } else {
          return this.finishToken(offset, TokenType.Dimension, content.join(""));
        }
      }
      return this.finishToken(offset, TokenType.Num);
    }
    content = [];
    var tokenType = this._string(content);
    if (tokenType !== null) {
      return this.finishToken(offset, tokenType, content.join(""));
    }
    tokenType = staticTokenTable[this.stream.peekChar()];
    if (typeof tokenType !== "undefined") {
      this.stream.advance(1);
      return this.finishToken(offset, tokenType);
    }
    if (this.stream.peekChar(0) === _TLD && this.stream.peekChar(1) === _EQS$1) {
      this.stream.advance(2);
      return this.finishToken(offset, TokenType.Includes);
    }
    if (this.stream.peekChar(0) === _PIP && this.stream.peekChar(1) === _EQS$1) {
      this.stream.advance(2);
      return this.finishToken(offset, TokenType.Dashmatch);
    }
    if (this.stream.peekChar(0) === _MUL && this.stream.peekChar(1) === _EQS$1) {
      this.stream.advance(2);
      return this.finishToken(offset, TokenType.SubstringOperator);
    }
    if (this.stream.peekChar(0) === _HAT && this.stream.peekChar(1) === _EQS$1) {
      this.stream.advance(2);
      return this.finishToken(offset, TokenType.PrefixOperator);
    }
    if (this.stream.peekChar(0) === _DLR$1 && this.stream.peekChar(1) === _EQS$1) {
      this.stream.advance(2);
      return this.finishToken(offset, TokenType.SuffixOperator);
    }
    this.stream.nextChar();
    return this.finishToken(offset, TokenType.Delim);
  };
  Scanner2.prototype.trivia = function() {
    while (true) {
      var offset = this.stream.pos();
      if (this._whitespace()) {
        if (!this.ignoreWhitespace) {
          return this.finishToken(offset, TokenType.Whitespace);
        }
      } else if (this.comment()) {
        if (!this.ignoreComment) {
          return this.finishToken(offset, TokenType.Comment);
        }
      } else {
        return null;
      }
    }
  };
  Scanner2.prototype.comment = function() {
    if (this.stream.advanceIfChars([_FSL$2, _MUL])) {
      var success_1 = false, hot_1 = false;
      this.stream.advanceWhileChar(function(ch) {
        if (hot_1 && ch === _FSL$2) {
          success_1 = true;
          return false;
        }
        hot_1 = ch === _MUL;
        return true;
      });
      if (success_1) {
        this.stream.advance(1);
      }
      return true;
    }
    return false;
  };
  Scanner2.prototype._number = function() {
    var npeek = 0, ch;
    if (this.stream.peekChar() === _DOT$2) {
      npeek = 1;
    }
    ch = this.stream.peekChar(npeek);
    if (ch >= _0$1 && ch <= _9$1) {
      this.stream.advance(npeek + 1);
      this.stream.advanceWhileChar(function(ch2) {
        return ch2 >= _0$1 && ch2 <= _9$1 || npeek === 0 && ch2 === _DOT$2;
      });
      return true;
    }
    return false;
  };
  Scanner2.prototype._newline = function(result) {
    var ch = this.stream.peekChar();
    switch (ch) {
      case _CAR$2:
      case _LFD$2:
      case _NWL$2:
        this.stream.advance(1);
        result.push(String.fromCharCode(ch));
        if (ch === _CAR$2 && this.stream.advanceIfChar(_NWL$2)) {
          result.push("\n");
        }
        return true;
    }
    return false;
  };
  Scanner2.prototype._escape = function(result, includeNewLines) {
    var ch = this.stream.peekChar();
    if (ch === _BSL) {
      this.stream.advance(1);
      ch = this.stream.peekChar();
      var hexNumCount = 0;
      while (hexNumCount < 6 && (ch >= _0$1 && ch <= _9$1 || ch >= _a && ch <= _f || ch >= _A && ch <= _F)) {
        this.stream.advance(1);
        ch = this.stream.peekChar();
        hexNumCount++;
      }
      if (hexNumCount > 0) {
        try {
          var hexVal = parseInt(this.stream.substring(this.stream.pos() - hexNumCount), 16);
          if (hexVal) {
            result.push(String.fromCharCode(hexVal));
          }
        } catch (e) {
        }
        if (ch === _WSP || ch === _TAB) {
          this.stream.advance(1);
        } else {
          this._newline([]);
        }
        return true;
      }
      if (ch !== _CAR$2 && ch !== _LFD$2 && ch !== _NWL$2) {
        this.stream.advance(1);
        result.push(String.fromCharCode(ch));
        return true;
      } else if (includeNewLines) {
        return this._newline(result);
      }
    }
    return false;
  };
  Scanner2.prototype._stringChar = function(closeQuote, result) {
    var ch = this.stream.peekChar();
    if (ch !== 0 && ch !== closeQuote && ch !== _BSL && ch !== _CAR$2 && ch !== _LFD$2 && ch !== _NWL$2) {
      this.stream.advance(1);
      result.push(String.fromCharCode(ch));
      return true;
    }
    return false;
  };
  Scanner2.prototype._string = function(result) {
    if (this.stream.peekChar() === _SQO || this.stream.peekChar() === _DQO) {
      var closeQuote = this.stream.nextChar();
      result.push(String.fromCharCode(closeQuote));
      while (this._stringChar(closeQuote, result) || this._escape(result, true)) {
      }
      if (this.stream.peekChar() === closeQuote) {
        this.stream.nextChar();
        result.push(String.fromCharCode(closeQuote));
        return TokenType.String;
      } else {
        return TokenType.BadString;
      }
    }
    return null;
  };
  Scanner2.prototype._unquotedChar = function(result) {
    var ch = this.stream.peekChar();
    if (ch !== 0 && ch !== _BSL && ch !== _SQO && ch !== _DQO && ch !== _LPA && ch !== _RPA && ch !== _WSP && ch !== _TAB && ch !== _NWL$2 && ch !== _LFD$2 && ch !== _CAR$2) {
      this.stream.advance(1);
      result.push(String.fromCharCode(ch));
      return true;
    }
    return false;
  };
  Scanner2.prototype._unquotedString = function(result) {
    var hasContent = false;
    while (this._unquotedChar(result) || this._escape(result)) {
      hasContent = true;
    }
    return hasContent;
  };
  Scanner2.prototype._whitespace = function() {
    var n = this.stream.advanceWhileChar(function(ch) {
      return ch === _WSP || ch === _TAB || ch === _NWL$2 || ch === _LFD$2 || ch === _CAR$2;
    });
    return n > 0;
  };
  Scanner2.prototype._name = function(result) {
    var matched = false;
    while (this._identChar(result) || this._escape(result)) {
      matched = true;
    }
    return matched;
  };
  Scanner2.prototype.ident = function(result) {
    var pos = this.stream.pos();
    var hasMinus = this._minus(result);
    if (hasMinus && this._minus(result)) {
      if (this._identFirstChar(result) || this._escape(result)) {
        while (this._identChar(result) || this._escape(result)) {
        }
        return true;
      }
    } else if (this._identFirstChar(result) || this._escape(result)) {
      while (this._identChar(result) || this._escape(result)) {
      }
      return true;
    }
    this.stream.goBackTo(pos);
    return false;
  };
  Scanner2.prototype._identFirstChar = function(result) {
    var ch = this.stream.peekChar();
    if (ch === _USC || ch >= _a && ch <= _z || ch >= _A && ch <= _Z || ch >= 128 && ch <= 65535) {
      this.stream.advance(1);
      result.push(String.fromCharCode(ch));
      return true;
    }
    return false;
  };
  Scanner2.prototype._minus = function(result) {
    var ch = this.stream.peekChar();
    if (ch === _MIN) {
      this.stream.advance(1);
      result.push(String.fromCharCode(ch));
      return true;
    }
    return false;
  };
  Scanner2.prototype._identChar = function(result) {
    var ch = this.stream.peekChar();
    if (ch === _USC || ch === _MIN || ch >= _a && ch <= _z || ch >= _A && ch <= _Z || ch >= _0$1 && ch <= _9$1 || ch >= 128 && ch <= 65535) {
      this.stream.advance(1);
      result.push(String.fromCharCode(ch));
      return true;
    }
    return false;
  };
  return Scanner2;
}();
function startsWith(haystack, needle) {
  if (haystack.length < needle.length) {
    return false;
  }
  for (var i = 0; i < needle.length; i++) {
    if (haystack[i] !== needle[i]) {
      return false;
    }
  }
  return true;
}
function endsWith(haystack, needle) {
  var diff = haystack.length - needle.length;
  if (diff > 0) {
    return haystack.lastIndexOf(needle) === diff;
  } else if (diff === 0) {
    return haystack === needle;
  } else {
    return false;
  }
}
function getLimitedString(str, ellipsis) {
  if (ellipsis === void 0) {
    ellipsis = true;
  }
  if (!str) {
    return "";
  }
  if (str.length < 140) {
    return str;
  }
  return str.slice(0, 140) + (ellipsis ? "\u2026" : "");
}
function trim(str, regexp) {
  var m = regexp.exec(str);
  if (m && m[0].length) {
    return str.substr(0, str.length - m[0].length);
  }
  return str;
}
var __extends$9 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var NodeType;
(function(NodeType2) {
  NodeType2[NodeType2["Undefined"] = 0] = "Undefined";
  NodeType2[NodeType2["Identifier"] = 1] = "Identifier";
  NodeType2[NodeType2["Stylesheet"] = 2] = "Stylesheet";
  NodeType2[NodeType2["Ruleset"] = 3] = "Ruleset";
  NodeType2[NodeType2["Selector"] = 4] = "Selector";
  NodeType2[NodeType2["SimpleSelector"] = 5] = "SimpleSelector";
  NodeType2[NodeType2["SelectorInterpolation"] = 6] = "SelectorInterpolation";
  NodeType2[NodeType2["SelectorCombinator"] = 7] = "SelectorCombinator";
  NodeType2[NodeType2["SelectorCombinatorParent"] = 8] = "SelectorCombinatorParent";
  NodeType2[NodeType2["SelectorCombinatorSibling"] = 9] = "SelectorCombinatorSibling";
  NodeType2[NodeType2["SelectorCombinatorAllSiblings"] = 10] = "SelectorCombinatorAllSiblings";
  NodeType2[NodeType2["SelectorCombinatorShadowPiercingDescendant"] = 11] = "SelectorCombinatorShadowPiercingDescendant";
  NodeType2[NodeType2["Page"] = 12] = "Page";
  NodeType2[NodeType2["PageBoxMarginBox"] = 13] = "PageBoxMarginBox";
  NodeType2[NodeType2["ClassSelector"] = 14] = "ClassSelector";
  NodeType2[NodeType2["IdentifierSelector"] = 15] = "IdentifierSelector";
  NodeType2[NodeType2["ElementNameSelector"] = 16] = "ElementNameSelector";
  NodeType2[NodeType2["PseudoSelector"] = 17] = "PseudoSelector";
  NodeType2[NodeType2["AttributeSelector"] = 18] = "AttributeSelector";
  NodeType2[NodeType2["Declaration"] = 19] = "Declaration";
  NodeType2[NodeType2["Declarations"] = 20] = "Declarations";
  NodeType2[NodeType2["Property"] = 21] = "Property";
  NodeType2[NodeType2["Expression"] = 22] = "Expression";
  NodeType2[NodeType2["BinaryExpression"] = 23] = "BinaryExpression";
  NodeType2[NodeType2["Term"] = 24] = "Term";
  NodeType2[NodeType2["Operator"] = 25] = "Operator";
  NodeType2[NodeType2["Value"] = 26] = "Value";
  NodeType2[NodeType2["StringLiteral"] = 27] = "StringLiteral";
  NodeType2[NodeType2["URILiteral"] = 28] = "URILiteral";
  NodeType2[NodeType2["EscapedValue"] = 29] = "EscapedValue";
  NodeType2[NodeType2["Function"] = 30] = "Function";
  NodeType2[NodeType2["NumericValue"] = 31] = "NumericValue";
  NodeType2[NodeType2["HexColorValue"] = 32] = "HexColorValue";
  NodeType2[NodeType2["MixinDeclaration"] = 33] = "MixinDeclaration";
  NodeType2[NodeType2["MixinReference"] = 34] = "MixinReference";
  NodeType2[NodeType2["VariableName"] = 35] = "VariableName";
  NodeType2[NodeType2["VariableDeclaration"] = 36] = "VariableDeclaration";
  NodeType2[NodeType2["Prio"] = 37] = "Prio";
  NodeType2[NodeType2["Interpolation"] = 38] = "Interpolation";
  NodeType2[NodeType2["NestedProperties"] = 39] = "NestedProperties";
  NodeType2[NodeType2["ExtendsReference"] = 40] = "ExtendsReference";
  NodeType2[NodeType2["SelectorPlaceholder"] = 41] = "SelectorPlaceholder";
  NodeType2[NodeType2["Debug"] = 42] = "Debug";
  NodeType2[NodeType2["If"] = 43] = "If";
  NodeType2[NodeType2["Else"] = 44] = "Else";
  NodeType2[NodeType2["For"] = 45] = "For";
  NodeType2[NodeType2["Each"] = 46] = "Each";
  NodeType2[NodeType2["While"] = 47] = "While";
  NodeType2[NodeType2["MixinContentReference"] = 48] = "MixinContentReference";
  NodeType2[NodeType2["MixinContentDeclaration"] = 49] = "MixinContentDeclaration";
  NodeType2[NodeType2["Media"] = 50] = "Media";
  NodeType2[NodeType2["Keyframe"] = 51] = "Keyframe";
  NodeType2[NodeType2["FontFace"] = 52] = "FontFace";
  NodeType2[NodeType2["Import"] = 53] = "Import";
  NodeType2[NodeType2["Namespace"] = 54] = "Namespace";
  NodeType2[NodeType2["Invocation"] = 55] = "Invocation";
  NodeType2[NodeType2["FunctionDeclaration"] = 56] = "FunctionDeclaration";
  NodeType2[NodeType2["ReturnStatement"] = 57] = "ReturnStatement";
  NodeType2[NodeType2["MediaQuery"] = 58] = "MediaQuery";
  NodeType2[NodeType2["FunctionParameter"] = 59] = "FunctionParameter";
  NodeType2[NodeType2["FunctionArgument"] = 60] = "FunctionArgument";
  NodeType2[NodeType2["KeyframeSelector"] = 61] = "KeyframeSelector";
  NodeType2[NodeType2["ViewPort"] = 62] = "ViewPort";
  NodeType2[NodeType2["Document"] = 63] = "Document";
  NodeType2[NodeType2["AtApplyRule"] = 64] = "AtApplyRule";
  NodeType2[NodeType2["CustomPropertyDeclaration"] = 65] = "CustomPropertyDeclaration";
  NodeType2[NodeType2["CustomPropertySet"] = 66] = "CustomPropertySet";
  NodeType2[NodeType2["ListEntry"] = 67] = "ListEntry";
  NodeType2[NodeType2["Supports"] = 68] = "Supports";
  NodeType2[NodeType2["SupportsCondition"] = 69] = "SupportsCondition";
  NodeType2[NodeType2["NamespacePrefix"] = 70] = "NamespacePrefix";
  NodeType2[NodeType2["GridLine"] = 71] = "GridLine";
  NodeType2[NodeType2["Plugin"] = 72] = "Plugin";
  NodeType2[NodeType2["UnknownAtRule"] = 73] = "UnknownAtRule";
  NodeType2[NodeType2["Use"] = 74] = "Use";
  NodeType2[NodeType2["ModuleConfiguration"] = 75] = "ModuleConfiguration";
  NodeType2[NodeType2["Forward"] = 76] = "Forward";
  NodeType2[NodeType2["ForwardVisibility"] = 77] = "ForwardVisibility";
  NodeType2[NodeType2["Module"] = 78] = "Module";
})(NodeType || (NodeType = {}));
var ReferenceType;
(function(ReferenceType2) {
  ReferenceType2[ReferenceType2["Mixin"] = 0] = "Mixin";
  ReferenceType2[ReferenceType2["Rule"] = 1] = "Rule";
  ReferenceType2[ReferenceType2["Variable"] = 2] = "Variable";
  ReferenceType2[ReferenceType2["Function"] = 3] = "Function";
  ReferenceType2[ReferenceType2["Keyframe"] = 4] = "Keyframe";
  ReferenceType2[ReferenceType2["Unknown"] = 5] = "Unknown";
  ReferenceType2[ReferenceType2["Module"] = 6] = "Module";
  ReferenceType2[ReferenceType2["Forward"] = 7] = "Forward";
  ReferenceType2[ReferenceType2["ForwardVisibility"] = 8] = "ForwardVisibility";
})(ReferenceType || (ReferenceType = {}));
function getNodeAtOffset(node, offset) {
  var candidate = null;
  if (!node || offset < node.offset || offset > node.end) {
    return null;
  }
  node.accept(function(node2) {
    if (node2.offset === -1 && node2.length === -1) {
      return true;
    }
    if (node2.offset <= offset && node2.end >= offset) {
      if (!candidate) {
        candidate = node2;
      } else if (node2.length <= candidate.length) {
        candidate = node2;
      }
      return true;
    }
    return false;
  });
  return candidate;
}
function getNodePath(node, offset) {
  var candidate = getNodeAtOffset(node, offset);
  var path = [];
  while (candidate) {
    path.unshift(candidate);
    candidate = candidate.parent;
  }
  return path;
}
function getParentDeclaration(node) {
  var decl = node.findParent(NodeType.Declaration);
  var value = decl && decl.getValue();
  if (value && value.encloses(node)) {
    return decl;
  }
  return null;
}
var Node = function() {
  function Node2(offset, len, nodeType) {
    if (offset === void 0) {
      offset = -1;
    }
    if (len === void 0) {
      len = -1;
    }
    this.parent = null;
    this.offset = offset;
    this.length = len;
    if (nodeType) {
      this.nodeType = nodeType;
    }
  }
  Object.defineProperty(Node2.prototype, "end", {
    get: function() {
      return this.offset + this.length;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(Node2.prototype, "type", {
    get: function() {
      return this.nodeType || NodeType.Undefined;
    },
    set: function(type) {
      this.nodeType = type;
    },
    enumerable: false,
    configurable: true
  });
  Node2.prototype.getTextProvider = function() {
    var node = this;
    while (node && !node.textProvider) {
      node = node.parent;
    }
    if (node) {
      return node.textProvider;
    }
    return function() {
      return "unknown";
    };
  };
  Node2.prototype.getText = function() {
    return this.getTextProvider()(this.offset, this.length);
  };
  Node2.prototype.matches = function(str) {
    return this.length === str.length && this.getTextProvider()(this.offset, this.length) === str;
  };
  Node2.prototype.startsWith = function(str) {
    return this.length >= str.length && this.getTextProvider()(this.offset, str.length) === str;
  };
  Node2.prototype.endsWith = function(str) {
    return this.length >= str.length && this.getTextProvider()(this.end - str.length, str.length) === str;
  };
  Node2.prototype.accept = function(visitor) {
    if (visitor(this) && this.children) {
      for (var _i = 0, _a2 = this.children; _i < _a2.length; _i++) {
        var child = _a2[_i];
        child.accept(visitor);
      }
    }
  };
  Node2.prototype.acceptVisitor = function(visitor) {
    this.accept(visitor.visitNode.bind(visitor));
  };
  Node2.prototype.adoptChild = function(node, index) {
    if (index === void 0) {
      index = -1;
    }
    if (node.parent && node.parent.children) {
      var idx = node.parent.children.indexOf(node);
      if (idx >= 0) {
        node.parent.children.splice(idx, 1);
      }
    }
    node.parent = this;
    var children = this.children;
    if (!children) {
      children = this.children = [];
    }
    if (index !== -1) {
      children.splice(index, 0, node);
    } else {
      children.push(node);
    }
    return node;
  };
  Node2.prototype.attachTo = function(parent, index) {
    if (index === void 0) {
      index = -1;
    }
    if (parent) {
      parent.adoptChild(this, index);
    }
    return this;
  };
  Node2.prototype.collectIssues = function(results) {
    if (this.issues) {
      results.push.apply(results, this.issues);
    }
  };
  Node2.prototype.addIssue = function(issue) {
    if (!this.issues) {
      this.issues = [];
    }
    this.issues.push(issue);
  };
  Node2.prototype.hasIssue = function(rule) {
    return Array.isArray(this.issues) && this.issues.some(function(i) {
      return i.getRule() === rule;
    });
  };
  Node2.prototype.isErroneous = function(recursive) {
    if (recursive === void 0) {
      recursive = false;
    }
    if (this.issues && this.issues.length > 0) {
      return true;
    }
    return recursive && Array.isArray(this.children) && this.children.some(function(c) {
      return c.isErroneous(true);
    });
  };
  Node2.prototype.setNode = function(field, node, index) {
    if (index === void 0) {
      index = -1;
    }
    if (node) {
      node.attachTo(this, index);
      this[field] = node;
      return true;
    }
    return false;
  };
  Node2.prototype.addChild = function(node) {
    if (node) {
      if (!this.children) {
        this.children = [];
      }
      node.attachTo(this);
      this.updateOffsetAndLength(node);
      return true;
    }
    return false;
  };
  Node2.prototype.updateOffsetAndLength = function(node) {
    if (node.offset < this.offset || this.offset === -1) {
      this.offset = node.offset;
    }
    var nodeEnd = node.end;
    if (nodeEnd > this.end || this.length === -1) {
      this.length = nodeEnd - this.offset;
    }
  };
  Node2.prototype.hasChildren = function() {
    return !!this.children && this.children.length > 0;
  };
  Node2.prototype.getChildren = function() {
    return this.children ? this.children.slice(0) : [];
  };
  Node2.prototype.getChild = function(index) {
    if (this.children && index < this.children.length) {
      return this.children[index];
    }
    return null;
  };
  Node2.prototype.addChildren = function(nodes) {
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
      var node = nodes_1[_i];
      this.addChild(node);
    }
  };
  Node2.prototype.findFirstChildBeforeOffset = function(offset) {
    if (this.children) {
      var current = null;
      for (var i = this.children.length - 1; i >= 0; i--) {
        current = this.children[i];
        if (current.offset <= offset) {
          return current;
        }
      }
    }
    return null;
  };
  Node2.prototype.findChildAtOffset = function(offset, goDeep) {
    var current = this.findFirstChildBeforeOffset(offset);
    if (current && current.end >= offset) {
      if (goDeep) {
        return current.findChildAtOffset(offset, true) || current;
      }
      return current;
    }
    return null;
  };
  Node2.prototype.encloses = function(candidate) {
    return this.offset <= candidate.offset && this.offset + this.length >= candidate.offset + candidate.length;
  };
  Node2.prototype.getParent = function() {
    var result = this.parent;
    while (result instanceof Nodelist) {
      result = result.parent;
    }
    return result;
  };
  Node2.prototype.findParent = function(type) {
    var result = this;
    while (result && result.type !== type) {
      result = result.parent;
    }
    return result;
  };
  Node2.prototype.findAParent = function() {
    var types = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      types[_i] = arguments[_i];
    }
    var result = this;
    while (result && !types.some(function(t) {
      return result.type === t;
    })) {
      result = result.parent;
    }
    return result;
  };
  Node2.prototype.setData = function(key, value) {
    if (!this.options) {
      this.options = {};
    }
    this.options[key] = value;
  };
  Node2.prototype.getData = function(key) {
    if (!this.options || !this.options.hasOwnProperty(key)) {
      return null;
    }
    return this.options[key];
  };
  return Node2;
}();
var Nodelist = function(_super) {
  __extends$9(Nodelist2, _super);
  function Nodelist2(parent, index) {
    if (index === void 0) {
      index = -1;
    }
    var _this = _super.call(this, -1, -1) || this;
    _this.attachTo(parent, index);
    _this.offset = -1;
    _this.length = -1;
    return _this;
  }
  return Nodelist2;
}(Node);
var Identifier = function(_super) {
  __extends$9(Identifier2, _super);
  function Identifier2(offset, length) {
    var _this = _super.call(this, offset, length) || this;
    _this.isCustomProperty = false;
    return _this;
  }
  Object.defineProperty(Identifier2.prototype, "type", {
    get: function() {
      return NodeType.Identifier;
    },
    enumerable: false,
    configurable: true
  });
  Identifier2.prototype.containsInterpolation = function() {
    return this.hasChildren();
  };
  return Identifier2;
}(Node);
var Stylesheet = function(_super) {
  __extends$9(Stylesheet2, _super);
  function Stylesheet2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Stylesheet2.prototype, "type", {
    get: function() {
      return NodeType.Stylesheet;
    },
    enumerable: false,
    configurable: true
  });
  return Stylesheet2;
}(Node);
var Declarations = function(_super) {
  __extends$9(Declarations2, _super);
  function Declarations2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Declarations2.prototype, "type", {
    get: function() {
      return NodeType.Declarations;
    },
    enumerable: false,
    configurable: true
  });
  return Declarations2;
}(Node);
var BodyDeclaration = function(_super) {
  __extends$9(BodyDeclaration2, _super);
  function BodyDeclaration2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  BodyDeclaration2.prototype.getDeclarations = function() {
    return this.declarations;
  };
  BodyDeclaration2.prototype.setDeclarations = function(decls) {
    return this.setNode("declarations", decls);
  };
  return BodyDeclaration2;
}(Node);
var RuleSet = function(_super) {
  __extends$9(RuleSet2, _super);
  function RuleSet2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(RuleSet2.prototype, "type", {
    get: function() {
      return NodeType.Ruleset;
    },
    enumerable: false,
    configurable: true
  });
  RuleSet2.prototype.getSelectors = function() {
    if (!this.selectors) {
      this.selectors = new Nodelist(this);
    }
    return this.selectors;
  };
  RuleSet2.prototype.isNested = function() {
    return !!this.parent && this.parent.findParent(NodeType.Declarations) !== null;
  };
  return RuleSet2;
}(BodyDeclaration);
var Selector = function(_super) {
  __extends$9(Selector2, _super);
  function Selector2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Selector2.prototype, "type", {
    get: function() {
      return NodeType.Selector;
    },
    enumerable: false,
    configurable: true
  });
  return Selector2;
}(Node);
var SimpleSelector = function(_super) {
  __extends$9(SimpleSelector2, _super);
  function SimpleSelector2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(SimpleSelector2.prototype, "type", {
    get: function() {
      return NodeType.SimpleSelector;
    },
    enumerable: false,
    configurable: true
  });
  return SimpleSelector2;
}(Node);
(function(_super) {
  __extends$9(AtApplyRule, _super);
  function AtApplyRule(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(AtApplyRule.prototype, "type", {
    get: function() {
      return NodeType.AtApplyRule;
    },
    enumerable: false,
    configurable: true
  });
  AtApplyRule.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  AtApplyRule.prototype.getIdentifier = function() {
    return this.identifier;
  };
  AtApplyRule.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  return AtApplyRule;
})(Node);
var AbstractDeclaration = function(_super) {
  __extends$9(AbstractDeclaration2, _super);
  function AbstractDeclaration2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  return AbstractDeclaration2;
}(Node);
var CustomPropertySet = function(_super) {
  __extends$9(CustomPropertySet2, _super);
  function CustomPropertySet2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(CustomPropertySet2.prototype, "type", {
    get: function() {
      return NodeType.CustomPropertySet;
    },
    enumerable: false,
    configurable: true
  });
  return CustomPropertySet2;
}(BodyDeclaration);
var Declaration = function(_super) {
  __extends$9(Declaration2, _super);
  function Declaration2(offset, length) {
    var _this = _super.call(this, offset, length) || this;
    _this.property = null;
    return _this;
  }
  Object.defineProperty(Declaration2.prototype, "type", {
    get: function() {
      return NodeType.Declaration;
    },
    enumerable: false,
    configurable: true
  });
  Declaration2.prototype.setProperty = function(node) {
    return this.setNode("property", node);
  };
  Declaration2.prototype.getProperty = function() {
    return this.property;
  };
  Declaration2.prototype.getFullPropertyName = function() {
    var propertyName = this.property ? this.property.getName() : "unknown";
    if (this.parent instanceof Declarations && this.parent.getParent() instanceof NestedProperties) {
      var parentDecl = this.parent.getParent().getParent();
      if (parentDecl instanceof Declaration2) {
        return parentDecl.getFullPropertyName() + propertyName;
      }
    }
    return propertyName;
  };
  Declaration2.prototype.getNonPrefixedPropertyName = function() {
    var propertyName = this.getFullPropertyName();
    if (propertyName && propertyName.charAt(0) === "-") {
      var vendorPrefixEnd = propertyName.indexOf("-", 1);
      if (vendorPrefixEnd !== -1) {
        return propertyName.substring(vendorPrefixEnd + 1);
      }
    }
    return propertyName;
  };
  Declaration2.prototype.setValue = function(value) {
    return this.setNode("value", value);
  };
  Declaration2.prototype.getValue = function() {
    return this.value;
  };
  Declaration2.prototype.setNestedProperties = function(value) {
    return this.setNode("nestedProperties", value);
  };
  Declaration2.prototype.getNestedProperties = function() {
    return this.nestedProperties;
  };
  return Declaration2;
}(AbstractDeclaration);
var CustomPropertyDeclaration = function(_super) {
  __extends$9(CustomPropertyDeclaration2, _super);
  function CustomPropertyDeclaration2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(CustomPropertyDeclaration2.prototype, "type", {
    get: function() {
      return NodeType.CustomPropertyDeclaration;
    },
    enumerable: false,
    configurable: true
  });
  CustomPropertyDeclaration2.prototype.setPropertySet = function(value) {
    return this.setNode("propertySet", value);
  };
  CustomPropertyDeclaration2.prototype.getPropertySet = function() {
    return this.propertySet;
  };
  return CustomPropertyDeclaration2;
}(Declaration);
var Property = function(_super) {
  __extends$9(Property2, _super);
  function Property2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Property2.prototype, "type", {
    get: function() {
      return NodeType.Property;
    },
    enumerable: false,
    configurable: true
  });
  Property2.prototype.setIdentifier = function(value) {
    return this.setNode("identifier", value);
  };
  Property2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  Property2.prototype.getName = function() {
    return trim(this.getText(), /[_\+]+$/);
  };
  Property2.prototype.isCustomProperty = function() {
    return !!this.identifier && this.identifier.isCustomProperty;
  };
  return Property2;
}(Node);
var Invocation = function(_super) {
  __extends$9(Invocation2, _super);
  function Invocation2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Invocation2.prototype, "type", {
    get: function() {
      return NodeType.Invocation;
    },
    enumerable: false,
    configurable: true
  });
  Invocation2.prototype.getArguments = function() {
    if (!this.arguments) {
      this.arguments = new Nodelist(this);
    }
    return this.arguments;
  };
  return Invocation2;
}(Node);
var Function = function(_super) {
  __extends$9(Function2, _super);
  function Function2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Function2.prototype, "type", {
    get: function() {
      return NodeType.Function;
    },
    enumerable: false,
    configurable: true
  });
  Function2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  Function2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  Function2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  return Function2;
}(Invocation);
var FunctionParameter = function(_super) {
  __extends$9(FunctionParameter2, _super);
  function FunctionParameter2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(FunctionParameter2.prototype, "type", {
    get: function() {
      return NodeType.FunctionParameter;
    },
    enumerable: false,
    configurable: true
  });
  FunctionParameter2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  FunctionParameter2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  FunctionParameter2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  FunctionParameter2.prototype.setDefaultValue = function(node) {
    return this.setNode("defaultValue", node, 0);
  };
  FunctionParameter2.prototype.getDefaultValue = function() {
    return this.defaultValue;
  };
  return FunctionParameter2;
}(Node);
var FunctionArgument = function(_super) {
  __extends$9(FunctionArgument2, _super);
  function FunctionArgument2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(FunctionArgument2.prototype, "type", {
    get: function() {
      return NodeType.FunctionArgument;
    },
    enumerable: false,
    configurable: true
  });
  FunctionArgument2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  FunctionArgument2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  FunctionArgument2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  FunctionArgument2.prototype.setValue = function(node) {
    return this.setNode("value", node, 0);
  };
  FunctionArgument2.prototype.getValue = function() {
    return this.value;
  };
  return FunctionArgument2;
}(Node);
var IfStatement = function(_super) {
  __extends$9(IfStatement2, _super);
  function IfStatement2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(IfStatement2.prototype, "type", {
    get: function() {
      return NodeType.If;
    },
    enumerable: false,
    configurable: true
  });
  IfStatement2.prototype.setExpression = function(node) {
    return this.setNode("expression", node, 0);
  };
  IfStatement2.prototype.setElseClause = function(elseClause) {
    return this.setNode("elseClause", elseClause);
  };
  return IfStatement2;
}(BodyDeclaration);
var ForStatement = function(_super) {
  __extends$9(ForStatement2, _super);
  function ForStatement2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(ForStatement2.prototype, "type", {
    get: function() {
      return NodeType.For;
    },
    enumerable: false,
    configurable: true
  });
  ForStatement2.prototype.setVariable = function(node) {
    return this.setNode("variable", node, 0);
  };
  return ForStatement2;
}(BodyDeclaration);
var EachStatement = function(_super) {
  __extends$9(EachStatement2, _super);
  function EachStatement2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(EachStatement2.prototype, "type", {
    get: function() {
      return NodeType.Each;
    },
    enumerable: false,
    configurable: true
  });
  EachStatement2.prototype.getVariables = function() {
    if (!this.variables) {
      this.variables = new Nodelist(this);
    }
    return this.variables;
  };
  return EachStatement2;
}(BodyDeclaration);
var WhileStatement = function(_super) {
  __extends$9(WhileStatement2, _super);
  function WhileStatement2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(WhileStatement2.prototype, "type", {
    get: function() {
      return NodeType.While;
    },
    enumerable: false,
    configurable: true
  });
  return WhileStatement2;
}(BodyDeclaration);
var ElseStatement = function(_super) {
  __extends$9(ElseStatement2, _super);
  function ElseStatement2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(ElseStatement2.prototype, "type", {
    get: function() {
      return NodeType.Else;
    },
    enumerable: false,
    configurable: true
  });
  return ElseStatement2;
}(BodyDeclaration);
var FunctionDeclaration = function(_super) {
  __extends$9(FunctionDeclaration2, _super);
  function FunctionDeclaration2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(FunctionDeclaration2.prototype, "type", {
    get: function() {
      return NodeType.FunctionDeclaration;
    },
    enumerable: false,
    configurable: true
  });
  FunctionDeclaration2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  FunctionDeclaration2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  FunctionDeclaration2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  FunctionDeclaration2.prototype.getParameters = function() {
    if (!this.parameters) {
      this.parameters = new Nodelist(this);
    }
    return this.parameters;
  };
  return FunctionDeclaration2;
}(BodyDeclaration);
var ViewPort = function(_super) {
  __extends$9(ViewPort2, _super);
  function ViewPort2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(ViewPort2.prototype, "type", {
    get: function() {
      return NodeType.ViewPort;
    },
    enumerable: false,
    configurable: true
  });
  return ViewPort2;
}(BodyDeclaration);
var FontFace = function(_super) {
  __extends$9(FontFace2, _super);
  function FontFace2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(FontFace2.prototype, "type", {
    get: function() {
      return NodeType.FontFace;
    },
    enumerable: false,
    configurable: true
  });
  return FontFace2;
}(BodyDeclaration);
var NestedProperties = function(_super) {
  __extends$9(NestedProperties2, _super);
  function NestedProperties2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(NestedProperties2.prototype, "type", {
    get: function() {
      return NodeType.NestedProperties;
    },
    enumerable: false,
    configurable: true
  });
  return NestedProperties2;
}(BodyDeclaration);
var Keyframe = function(_super) {
  __extends$9(Keyframe2, _super);
  function Keyframe2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Keyframe2.prototype, "type", {
    get: function() {
      return NodeType.Keyframe;
    },
    enumerable: false,
    configurable: true
  });
  Keyframe2.prototype.setKeyword = function(keyword) {
    return this.setNode("keyword", keyword, 0);
  };
  Keyframe2.prototype.getKeyword = function() {
    return this.keyword;
  };
  Keyframe2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  Keyframe2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  Keyframe2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  return Keyframe2;
}(BodyDeclaration);
var KeyframeSelector = function(_super) {
  __extends$9(KeyframeSelector2, _super);
  function KeyframeSelector2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(KeyframeSelector2.prototype, "type", {
    get: function() {
      return NodeType.KeyframeSelector;
    },
    enumerable: false,
    configurable: true
  });
  return KeyframeSelector2;
}(BodyDeclaration);
var Import = function(_super) {
  __extends$9(Import2, _super);
  function Import2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Import2.prototype, "type", {
    get: function() {
      return NodeType.Import;
    },
    enumerable: false,
    configurable: true
  });
  Import2.prototype.setMedialist = function(node) {
    if (node) {
      node.attachTo(this);
      return true;
    }
    return false;
  };
  return Import2;
}(Node);
var Use = function(_super) {
  __extends$9(Use2, _super);
  function Use2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(Use2.prototype, "type", {
    get: function() {
      return NodeType.Use;
    },
    enumerable: false,
    configurable: true
  });
  Use2.prototype.getParameters = function() {
    if (!this.parameters) {
      this.parameters = new Nodelist(this);
    }
    return this.parameters;
  };
  Use2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  Use2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  return Use2;
}(Node);
var ModuleConfiguration = function(_super) {
  __extends$9(ModuleConfiguration2, _super);
  function ModuleConfiguration2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(ModuleConfiguration2.prototype, "type", {
    get: function() {
      return NodeType.ModuleConfiguration;
    },
    enumerable: false,
    configurable: true
  });
  ModuleConfiguration2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  ModuleConfiguration2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  ModuleConfiguration2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  ModuleConfiguration2.prototype.setValue = function(node) {
    return this.setNode("value", node, 0);
  };
  ModuleConfiguration2.prototype.getValue = function() {
    return this.value;
  };
  return ModuleConfiguration2;
}(Node);
var Forward = function(_super) {
  __extends$9(Forward2, _super);
  function Forward2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(Forward2.prototype, "type", {
    get: function() {
      return NodeType.Forward;
    },
    enumerable: false,
    configurable: true
  });
  Forward2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  Forward2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  Forward2.prototype.getMembers = function() {
    if (!this.members) {
      this.members = new Nodelist(this);
    }
    return this.members;
  };
  Forward2.prototype.getParameters = function() {
    if (!this.parameters) {
      this.parameters = new Nodelist(this);
    }
    return this.parameters;
  };
  return Forward2;
}(Node);
var ForwardVisibility = function(_super) {
  __extends$9(ForwardVisibility2, _super);
  function ForwardVisibility2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(ForwardVisibility2.prototype, "type", {
    get: function() {
      return NodeType.ForwardVisibility;
    },
    enumerable: false,
    configurable: true
  });
  ForwardVisibility2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  ForwardVisibility2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  return ForwardVisibility2;
}(Node);
var Namespace = function(_super) {
  __extends$9(Namespace2, _super);
  function Namespace2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Namespace2.prototype, "type", {
    get: function() {
      return NodeType.Namespace;
    },
    enumerable: false,
    configurable: true
  });
  return Namespace2;
}(Node);
var Media = function(_super) {
  __extends$9(Media2, _super);
  function Media2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Media2.prototype, "type", {
    get: function() {
      return NodeType.Media;
    },
    enumerable: false,
    configurable: true
  });
  return Media2;
}(BodyDeclaration);
var Supports = function(_super) {
  __extends$9(Supports2, _super);
  function Supports2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Supports2.prototype, "type", {
    get: function() {
      return NodeType.Supports;
    },
    enumerable: false,
    configurable: true
  });
  return Supports2;
}(BodyDeclaration);
var Document = function(_super) {
  __extends$9(Document2, _super);
  function Document2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Document2.prototype, "type", {
    get: function() {
      return NodeType.Document;
    },
    enumerable: false,
    configurable: true
  });
  return Document2;
}(BodyDeclaration);
var Medialist = function(_super) {
  __extends$9(Medialist2, _super);
  function Medialist2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Medialist2.prototype.getMediums = function() {
    if (!this.mediums) {
      this.mediums = new Nodelist(this);
    }
    return this.mediums;
  };
  return Medialist2;
}(Node);
var MediaQuery = function(_super) {
  __extends$9(MediaQuery2, _super);
  function MediaQuery2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(MediaQuery2.prototype, "type", {
    get: function() {
      return NodeType.MediaQuery;
    },
    enumerable: false,
    configurable: true
  });
  return MediaQuery2;
}(Node);
var SupportsCondition = function(_super) {
  __extends$9(SupportsCondition2, _super);
  function SupportsCondition2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(SupportsCondition2.prototype, "type", {
    get: function() {
      return NodeType.SupportsCondition;
    },
    enumerable: false,
    configurable: true
  });
  return SupportsCondition2;
}(Node);
var Page = function(_super) {
  __extends$9(Page2, _super);
  function Page2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Page2.prototype, "type", {
    get: function() {
      return NodeType.Page;
    },
    enumerable: false,
    configurable: true
  });
  return Page2;
}(BodyDeclaration);
var PageBoxMarginBox = function(_super) {
  __extends$9(PageBoxMarginBox2, _super);
  function PageBoxMarginBox2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(PageBoxMarginBox2.prototype, "type", {
    get: function() {
      return NodeType.PageBoxMarginBox;
    },
    enumerable: false,
    configurable: true
  });
  return PageBoxMarginBox2;
}(BodyDeclaration);
var Expression = function(_super) {
  __extends$9(Expression2, _super);
  function Expression2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Expression2.prototype, "type", {
    get: function() {
      return NodeType.Expression;
    },
    enumerable: false,
    configurable: true
  });
  return Expression2;
}(Node);
var BinaryExpression = function(_super) {
  __extends$9(BinaryExpression2, _super);
  function BinaryExpression2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(BinaryExpression2.prototype, "type", {
    get: function() {
      return NodeType.BinaryExpression;
    },
    enumerable: false,
    configurable: true
  });
  BinaryExpression2.prototype.setLeft = function(left) {
    return this.setNode("left", left);
  };
  BinaryExpression2.prototype.getLeft = function() {
    return this.left;
  };
  BinaryExpression2.prototype.setRight = function(right) {
    return this.setNode("right", right);
  };
  BinaryExpression2.prototype.getRight = function() {
    return this.right;
  };
  BinaryExpression2.prototype.setOperator = function(value) {
    return this.setNode("operator", value);
  };
  BinaryExpression2.prototype.getOperator = function() {
    return this.operator;
  };
  return BinaryExpression2;
}(Node);
var Term = function(_super) {
  __extends$9(Term2, _super);
  function Term2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Term2.prototype, "type", {
    get: function() {
      return NodeType.Term;
    },
    enumerable: false,
    configurable: true
  });
  Term2.prototype.setOperator = function(value) {
    return this.setNode("operator", value);
  };
  Term2.prototype.getOperator = function() {
    return this.operator;
  };
  Term2.prototype.setExpression = function(value) {
    return this.setNode("expression", value);
  };
  Term2.prototype.getExpression = function() {
    return this.expression;
  };
  return Term2;
}(Node);
var AttributeSelector = function(_super) {
  __extends$9(AttributeSelector2, _super);
  function AttributeSelector2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(AttributeSelector2.prototype, "type", {
    get: function() {
      return NodeType.AttributeSelector;
    },
    enumerable: false,
    configurable: true
  });
  AttributeSelector2.prototype.setNamespacePrefix = function(value) {
    return this.setNode("namespacePrefix", value);
  };
  AttributeSelector2.prototype.getNamespacePrefix = function() {
    return this.namespacePrefix;
  };
  AttributeSelector2.prototype.setIdentifier = function(value) {
    return this.setNode("identifier", value);
  };
  AttributeSelector2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  AttributeSelector2.prototype.setOperator = function(operator) {
    return this.setNode("operator", operator);
  };
  AttributeSelector2.prototype.getOperator = function() {
    return this.operator;
  };
  AttributeSelector2.prototype.setValue = function(value) {
    return this.setNode("value", value);
  };
  AttributeSelector2.prototype.getValue = function() {
    return this.value;
  };
  return AttributeSelector2;
}(Node);
(function(_super) {
  __extends$9(Operator, _super);
  function Operator(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Operator.prototype, "type", {
    get: function() {
      return NodeType.Operator;
    },
    enumerable: false,
    configurable: true
  });
  return Operator;
})(Node);
var HexColorValue = function(_super) {
  __extends$9(HexColorValue2, _super);
  function HexColorValue2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(HexColorValue2.prototype, "type", {
    get: function() {
      return NodeType.HexColorValue;
    },
    enumerable: false,
    configurable: true
  });
  return HexColorValue2;
}(Node);
var _dot = ".".charCodeAt(0), _0 = "0".charCodeAt(0), _9 = "9".charCodeAt(0);
var NumericValue = function(_super) {
  __extends$9(NumericValue2, _super);
  function NumericValue2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(NumericValue2.prototype, "type", {
    get: function() {
      return NodeType.NumericValue;
    },
    enumerable: false,
    configurable: true
  });
  NumericValue2.prototype.getValue = function() {
    var raw = this.getText();
    var unitIdx = 0;
    var code;
    for (var i = 0, len = raw.length; i < len; i++) {
      code = raw.charCodeAt(i);
      if (!(_0 <= code && code <= _9 || code === _dot)) {
        break;
      }
      unitIdx += 1;
    }
    return {
      value: raw.substring(0, unitIdx),
      unit: unitIdx < raw.length ? raw.substring(unitIdx) : void 0
    };
  };
  return NumericValue2;
}(Node);
var VariableDeclaration = function(_super) {
  __extends$9(VariableDeclaration2, _super);
  function VariableDeclaration2(offset, length) {
    var _this = _super.call(this, offset, length) || this;
    _this.variable = null;
    _this.value = null;
    _this.needsSemicolon = true;
    return _this;
  }
  Object.defineProperty(VariableDeclaration2.prototype, "type", {
    get: function() {
      return NodeType.VariableDeclaration;
    },
    enumerable: false,
    configurable: true
  });
  VariableDeclaration2.prototype.setVariable = function(node) {
    if (node) {
      node.attachTo(this);
      this.variable = node;
      return true;
    }
    return false;
  };
  VariableDeclaration2.prototype.getVariable = function() {
    return this.variable;
  };
  VariableDeclaration2.prototype.getName = function() {
    return this.variable ? this.variable.getName() : "";
  };
  VariableDeclaration2.prototype.setValue = function(node) {
    if (node) {
      node.attachTo(this);
      this.value = node;
      return true;
    }
    return false;
  };
  VariableDeclaration2.prototype.getValue = function() {
    return this.value;
  };
  return VariableDeclaration2;
}(AbstractDeclaration);
var Interpolation = function(_super) {
  __extends$9(Interpolation2, _super);
  function Interpolation2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Interpolation2.prototype, "type", {
    get: function() {
      return NodeType.Interpolation;
    },
    enumerable: false,
    configurable: true
  });
  return Interpolation2;
}(Node);
var Variable = function(_super) {
  __extends$9(Variable2, _super);
  function Variable2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(Variable2.prototype, "type", {
    get: function() {
      return NodeType.VariableName;
    },
    enumerable: false,
    configurable: true
  });
  Variable2.prototype.getName = function() {
    return this.getText();
  };
  return Variable2;
}(Node);
var ExtendsReference = function(_super) {
  __extends$9(ExtendsReference2, _super);
  function ExtendsReference2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(ExtendsReference2.prototype, "type", {
    get: function() {
      return NodeType.ExtendsReference;
    },
    enumerable: false,
    configurable: true
  });
  ExtendsReference2.prototype.getSelectors = function() {
    if (!this.selectors) {
      this.selectors = new Nodelist(this);
    }
    return this.selectors;
  };
  return ExtendsReference2;
}(Node);
var MixinContentReference = function(_super) {
  __extends$9(MixinContentReference2, _super);
  function MixinContentReference2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(MixinContentReference2.prototype, "type", {
    get: function() {
      return NodeType.MixinContentReference;
    },
    enumerable: false,
    configurable: true
  });
  MixinContentReference2.prototype.getArguments = function() {
    if (!this.arguments) {
      this.arguments = new Nodelist(this);
    }
    return this.arguments;
  };
  return MixinContentReference2;
}(Node);
var MixinContentDeclaration = function(_super) {
  __extends$9(MixinContentDeclaration2, _super);
  function MixinContentDeclaration2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(MixinContentDeclaration2.prototype, "type", {
    get: function() {
      return NodeType.MixinContentReference;
    },
    enumerable: false,
    configurable: true
  });
  MixinContentDeclaration2.prototype.getParameters = function() {
    if (!this.parameters) {
      this.parameters = new Nodelist(this);
    }
    return this.parameters;
  };
  return MixinContentDeclaration2;
}(BodyDeclaration);
var MixinReference = function(_super) {
  __extends$9(MixinReference2, _super);
  function MixinReference2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(MixinReference2.prototype, "type", {
    get: function() {
      return NodeType.MixinReference;
    },
    enumerable: false,
    configurable: true
  });
  MixinReference2.prototype.getNamespaces = function() {
    if (!this.namespaces) {
      this.namespaces = new Nodelist(this);
    }
    return this.namespaces;
  };
  MixinReference2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  MixinReference2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  MixinReference2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  MixinReference2.prototype.getArguments = function() {
    if (!this.arguments) {
      this.arguments = new Nodelist(this);
    }
    return this.arguments;
  };
  MixinReference2.prototype.setContent = function(node) {
    return this.setNode("content", node);
  };
  MixinReference2.prototype.getContent = function() {
    return this.content;
  };
  return MixinReference2;
}(Node);
var MixinDeclaration = function(_super) {
  __extends$9(MixinDeclaration2, _super);
  function MixinDeclaration2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(MixinDeclaration2.prototype, "type", {
    get: function() {
      return NodeType.MixinDeclaration;
    },
    enumerable: false,
    configurable: true
  });
  MixinDeclaration2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  MixinDeclaration2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  MixinDeclaration2.prototype.getName = function() {
    return this.identifier ? this.identifier.getText() : "";
  };
  MixinDeclaration2.prototype.getParameters = function() {
    if (!this.parameters) {
      this.parameters = new Nodelist(this);
    }
    return this.parameters;
  };
  MixinDeclaration2.prototype.setGuard = function(node) {
    if (node) {
      node.attachTo(this);
      this.guard = node;
    }
    return false;
  };
  return MixinDeclaration2;
}(BodyDeclaration);
var UnknownAtRule = function(_super) {
  __extends$9(UnknownAtRule2, _super);
  function UnknownAtRule2(offset, length) {
    return _super.call(this, offset, length) || this;
  }
  Object.defineProperty(UnknownAtRule2.prototype, "type", {
    get: function() {
      return NodeType.UnknownAtRule;
    },
    enumerable: false,
    configurable: true
  });
  UnknownAtRule2.prototype.setAtRuleName = function(atRuleName) {
    this.atRuleName = atRuleName;
  };
  UnknownAtRule2.prototype.getAtRuleName = function() {
    return this.atRuleName;
  };
  return UnknownAtRule2;
}(BodyDeclaration);
var ListEntry = function(_super) {
  __extends$9(ListEntry2, _super);
  function ListEntry2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(ListEntry2.prototype, "type", {
    get: function() {
      return NodeType.ListEntry;
    },
    enumerable: false,
    configurable: true
  });
  ListEntry2.prototype.setKey = function(node) {
    return this.setNode("key", node, 0);
  };
  ListEntry2.prototype.setValue = function(node) {
    return this.setNode("value", node, 1);
  };
  return ListEntry2;
}(Node);
var LessGuard = function(_super) {
  __extends$9(LessGuard2, _super);
  function LessGuard2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  LessGuard2.prototype.getConditions = function() {
    if (!this.conditions) {
      this.conditions = new Nodelist(this);
    }
    return this.conditions;
  };
  return LessGuard2;
}(Node);
var GuardCondition = function(_super) {
  __extends$9(GuardCondition2, _super);
  function GuardCondition2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  GuardCondition2.prototype.setVariable = function(node) {
    return this.setNode("variable", node);
  };
  return GuardCondition2;
}(Node);
var Module = function(_super) {
  __extends$9(Module2, _super);
  function Module2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  Object.defineProperty(Module2.prototype, "type", {
    get: function() {
      return NodeType.Module;
    },
    enumerable: false,
    configurable: true
  });
  Module2.prototype.setIdentifier = function(node) {
    return this.setNode("identifier", node, 0);
  };
  Module2.prototype.getIdentifier = function() {
    return this.identifier;
  };
  return Module2;
}(Node);
var Level;
(function(Level2) {
  Level2[Level2["Ignore"] = 1] = "Ignore";
  Level2[Level2["Warning"] = 2] = "Warning";
  Level2[Level2["Error"] = 4] = "Error";
})(Level || (Level = {}));
var Marker = function() {
  function Marker2(node, rule, level, message, offset, length) {
    if (offset === void 0) {
      offset = node.offset;
    }
    if (length === void 0) {
      length = node.length;
    }
    this.node = node;
    this.rule = rule;
    this.level = level;
    this.message = message || rule.message;
    this.offset = offset;
    this.length = length;
  }
  Marker2.prototype.getRule = function() {
    return this.rule;
  };
  Marker2.prototype.getLevel = function() {
    return this.level;
  };
  Marker2.prototype.getOffset = function() {
    return this.offset;
  };
  Marker2.prototype.getLength = function() {
    return this.length;
  };
  Marker2.prototype.getNode = function() {
    return this.node;
  };
  Marker2.prototype.getMessage = function() {
    return this.message;
  };
  return Marker2;
}();
function format(message, args) {
  var result;
  if (args.length === 0) {
    result = message;
  } else {
    result = message.replace(/\{(\d+)\}/g, function(match, rest) {
      var index = rest[0];
      return typeof args[index] !== "undefined" ? args[index] : match;
    });
  }
  return result;
}
function localize$8(key, message) {
  var args = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    args[_i - 2] = arguments[_i];
  }
  return format(message, args);
}
function loadMessageBundle(file) {
  return localize$8;
}
var localize$7 = loadMessageBundle();
var CSSIssueType = function() {
  function CSSIssueType2(id, message) {
    this.id = id;
    this.message = message;
  }
  return CSSIssueType2;
}();
var ParseError = {
  NumberExpected: new CSSIssueType("css-numberexpected", localize$7("expected.number", "number expected")),
  ConditionExpected: new CSSIssueType("css-conditionexpected", localize$7("expected.condt", "condition expected")),
  RuleOrSelectorExpected: new CSSIssueType("css-ruleorselectorexpected", localize$7("expected.ruleorselector", "at-rule or selector expected")),
  DotExpected: new CSSIssueType("css-dotexpected", localize$7("expected.dot", "dot expected")),
  ColonExpected: new CSSIssueType("css-colonexpected", localize$7("expected.colon", "colon expected")),
  SemiColonExpected: new CSSIssueType("css-semicolonexpected", localize$7("expected.semicolon", "semi-colon expected")),
  TermExpected: new CSSIssueType("css-termexpected", localize$7("expected.term", "term expected")),
  ExpressionExpected: new CSSIssueType("css-expressionexpected", localize$7("expected.expression", "expression expected")),
  OperatorExpected: new CSSIssueType("css-operatorexpected", localize$7("expected.operator", "operator expected")),
  IdentifierExpected: new CSSIssueType("css-identifierexpected", localize$7("expected.ident", "identifier expected")),
  PercentageExpected: new CSSIssueType("css-percentageexpected", localize$7("expected.percentage", "percentage expected")),
  URIOrStringExpected: new CSSIssueType("css-uriorstringexpected", localize$7("expected.uriorstring", "uri or string expected")),
  URIExpected: new CSSIssueType("css-uriexpected", localize$7("expected.uri", "URI expected")),
  VariableNameExpected: new CSSIssueType("css-varnameexpected", localize$7("expected.varname", "variable name expected")),
  VariableValueExpected: new CSSIssueType("css-varvalueexpected", localize$7("expected.varvalue", "variable value expected")),
  PropertyValueExpected: new CSSIssueType("css-propertyvalueexpected", localize$7("expected.propvalue", "property value expected")),
  LeftCurlyExpected: new CSSIssueType("css-lcurlyexpected", localize$7("expected.lcurly", "{ expected")),
  RightCurlyExpected: new CSSIssueType("css-rcurlyexpected", localize$7("expected.rcurly", "} expected")),
  LeftSquareBracketExpected: new CSSIssueType("css-rbracketexpected", localize$7("expected.lsquare", "[ expected")),
  RightSquareBracketExpected: new CSSIssueType("css-lbracketexpected", localize$7("expected.rsquare", "] expected")),
  LeftParenthesisExpected: new CSSIssueType("css-lparentexpected", localize$7("expected.lparen", "( expected")),
  RightParenthesisExpected: new CSSIssueType("css-rparentexpected", localize$7("expected.rparent", ") expected")),
  CommaExpected: new CSSIssueType("css-commaexpected", localize$7("expected.comma", "comma expected")),
  PageDirectiveOrDeclarationExpected: new CSSIssueType("css-pagedirordeclexpected", localize$7("expected.pagedirordecl", "page directive or declaraton expected")),
  UnknownAtRule: new CSSIssueType("css-unknownatrule", localize$7("unknown.atrule", "at-rule unknown")),
  UnknownKeyword: new CSSIssueType("css-unknownkeyword", localize$7("unknown.keyword", "unknown keyword")),
  SelectorExpected: new CSSIssueType("css-selectorexpected", localize$7("expected.selector", "selector expected")),
  StringLiteralExpected: new CSSIssueType("css-stringliteralexpected", localize$7("expected.stringliteral", "string literal expected")),
  WhitespaceExpected: new CSSIssueType("css-whitespaceexpected", localize$7("expected.whitespace", "whitespace expected")),
  MediaQueryExpected: new CSSIssueType("css-mediaqueryexpected", localize$7("expected.mediaquery", "media query expected")),
  IdentifierOrWildcardExpected: new CSSIssueType("css-idorwildcardexpected", localize$7("expected.idorwildcard", "identifier or wildcard expected")),
  WildcardExpected: new CSSIssueType("css-wildcardexpected", localize$7("expected.wildcard", "wildcard expected")),
  IdentifierOrVariableExpected: new CSSIssueType("css-idorvarexpected", localize$7("expected.idorvar", "identifier or variable expected"))
};
var browserNames = {
  E: "Edge",
  FF: "Firefox",
  S: "Safari",
  C: "Chrome",
  IE: "IE",
  O: "Opera"
};
function getEntryStatus(status) {
  switch (status) {
    case "experimental":
      return "\u26A0\uFE0F Property is experimental. Be cautious when using it.\uFE0F\n\n";
    case "nonstandard":
      return "\u{1F6A8}\uFE0F Property is nonstandard. Avoid using it.\n\n";
    case "obsolete":
      return "\u{1F6A8}\uFE0F\uFE0F\uFE0F Property is obsolete. Avoid using it.\n\n";
    default:
      return "";
  }
}
function getEntryDescription(entry, doesSupportMarkdown, settings) {
  var result;
  if (doesSupportMarkdown) {
    result = {
      kind: "markdown",
      value: getEntryMarkdownDescription(entry, settings)
    };
  } else {
    result = {
      kind: "plaintext",
      value: getEntryStringDescription(entry, settings)
    };
  }
  if (result.value === "") {
    return void 0;
  }
  return result;
}
function textToMarkedString(text) {
  text = text.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
  return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function getEntryStringDescription(entry, settings) {
  if (!entry.description || entry.description === "") {
    return "";
  }
  if (typeof entry.description !== "string") {
    return entry.description.value;
  }
  var result = "";
  if ((settings === null || settings === void 0 ? void 0 : settings.documentation) !== false) {
    if (entry.status) {
      result += getEntryStatus(entry.status);
    }
    result += entry.description;
    var browserLabel = getBrowserLabel(entry.browsers);
    if (browserLabel) {
      result += "\n(" + browserLabel + ")";
    }
    if ("syntax" in entry) {
      result += "\n\nSyntax: " + entry.syntax;
    }
  }
  if (entry.references && entry.references.length > 0 && (settings === null || settings === void 0 ? void 0 : settings.references) !== false) {
    if (result.length > 0) {
      result += "\n\n";
    }
    result += entry.references.map(function(r) {
      return r.name + ": " + r.url;
    }).join(" | ");
  }
  return result;
}
function getEntryMarkdownDescription(entry, settings) {
  if (!entry.description || entry.description === "") {
    return "";
  }
  var result = "";
  if ((settings === null || settings === void 0 ? void 0 : settings.documentation) !== false) {
    if (entry.status) {
      result += getEntryStatus(entry.status);
    }
    var description = typeof entry.description === "string" ? entry.description : entry.description.value;
    result += textToMarkedString(description);
    var browserLabel = getBrowserLabel(entry.browsers);
    if (browserLabel) {
      result += "\n\n(" + textToMarkedString(browserLabel) + ")";
    }
    if ("syntax" in entry && entry.syntax) {
      result += "\n\nSyntax: " + textToMarkedString(entry.syntax);
    }
  }
  if (entry.references && entry.references.length > 0 && (settings === null || settings === void 0 ? void 0 : settings.references) !== false) {
    if (result.length > 0) {
      result += "\n\n";
    }
    result += entry.references.map(function(r) {
      return "[" + r.name + "](" + r.url + ")";
    }).join(" | ");
  }
  return result;
}
function getBrowserLabel(browsers) {
  if (browsers === void 0) {
    browsers = [];
  }
  if (browsers.length === 0) {
    return null;
  }
  return browsers.map(function(b) {
    var result = "";
    var matches = b.match(/([A-Z]+)(\d+)?/);
    var name = matches[1];
    var version = matches[2];
    if (name in browserNames) {
      result += browserNames[name];
    }
    if (version) {
      result += " " + version;
    }
    return result;
  }).join(", ");
}
var localize$6 = loadMessageBundle();
var colorFunctions = [
  { func: "rgb($red, $green, $blue)", desc: localize$6("css.builtin.rgb", "Creates a Color from red, green, and blue values.") },
  { func: "rgba($red, $green, $blue, $alpha)", desc: localize$6("css.builtin.rgba", "Creates a Color from red, green, blue, and alpha values.") },
  { func: "hsl($hue, $saturation, $lightness)", desc: localize$6("css.builtin.hsl", "Creates a Color from hue, saturation, and lightness values.") },
  { func: "hsla($hue, $saturation, $lightness, $alpha)", desc: localize$6("css.builtin.hsla", "Creates a Color from hue, saturation, lightness, and alpha values.") }
];
var colors = {
  aliceblue: "#f0f8ff",
  antiquewhite: "#faebd7",
  aqua: "#00ffff",
  aquamarine: "#7fffd4",
  azure: "#f0ffff",
  beige: "#f5f5dc",
  bisque: "#ffe4c4",
  black: "#000000",
  blanchedalmond: "#ffebcd",
  blue: "#0000ff",
  blueviolet: "#8a2be2",
  brown: "#a52a2a",
  burlywood: "#deb887",
  cadetblue: "#5f9ea0",
  chartreuse: "#7fff00",
  chocolate: "#d2691e",
  coral: "#ff7f50",
  cornflowerblue: "#6495ed",
  cornsilk: "#fff8dc",
  crimson: "#dc143c",
  cyan: "#00ffff",
  darkblue: "#00008b",
  darkcyan: "#008b8b",
  darkgoldenrod: "#b8860b",
  darkgray: "#a9a9a9",
  darkgrey: "#a9a9a9",
  darkgreen: "#006400",
  darkkhaki: "#bdb76b",
  darkmagenta: "#8b008b",
  darkolivegreen: "#556b2f",
  darkorange: "#ff8c00",
  darkorchid: "#9932cc",
  darkred: "#8b0000",
  darksalmon: "#e9967a",
  darkseagreen: "#8fbc8f",
  darkslateblue: "#483d8b",
  darkslategray: "#2f4f4f",
  darkslategrey: "#2f4f4f",
  darkturquoise: "#00ced1",
  darkviolet: "#9400d3",
  deeppink: "#ff1493",
  deepskyblue: "#00bfff",
  dimgray: "#696969",
  dimgrey: "#696969",
  dodgerblue: "#1e90ff",
  firebrick: "#b22222",
  floralwhite: "#fffaf0",
  forestgreen: "#228b22",
  fuchsia: "#ff00ff",
  gainsboro: "#dcdcdc",
  ghostwhite: "#f8f8ff",
  gold: "#ffd700",
  goldenrod: "#daa520",
  gray: "#808080",
  grey: "#808080",
  green: "#008000",
  greenyellow: "#adff2f",
  honeydew: "#f0fff0",
  hotpink: "#ff69b4",
  indianred: "#cd5c5c",
  indigo: "#4b0082",
  ivory: "#fffff0",
  khaki: "#f0e68c",
  lavender: "#e6e6fa",
  lavenderblush: "#fff0f5",
  lawngreen: "#7cfc00",
  lemonchiffon: "#fffacd",
  lightblue: "#add8e6",
  lightcoral: "#f08080",
  lightcyan: "#e0ffff",
  lightgoldenrodyellow: "#fafad2",
  lightgray: "#d3d3d3",
  lightgrey: "#d3d3d3",
  lightgreen: "#90ee90",
  lightpink: "#ffb6c1",
  lightsalmon: "#ffa07a",
  lightseagreen: "#20b2aa",
  lightskyblue: "#87cefa",
  lightslategray: "#778899",
  lightslategrey: "#778899",
  lightsteelblue: "#b0c4de",
  lightyellow: "#ffffe0",
  lime: "#00ff00",
  limegreen: "#32cd32",
  linen: "#faf0e6",
  magenta: "#ff00ff",
  maroon: "#800000",
  mediumaquamarine: "#66cdaa",
  mediumblue: "#0000cd",
  mediumorchid: "#ba55d3",
  mediumpurple: "#9370d8",
  mediumseagreen: "#3cb371",
  mediumslateblue: "#7b68ee",
  mediumspringgreen: "#00fa9a",
  mediumturquoise: "#48d1cc",
  mediumvioletred: "#c71585",
  midnightblue: "#191970",
  mintcream: "#f5fffa",
  mistyrose: "#ffe4e1",
  moccasin: "#ffe4b5",
  navajowhite: "#ffdead",
  navy: "#000080",
  oldlace: "#fdf5e6",
  olive: "#808000",
  olivedrab: "#6b8e23",
  orange: "#ffa500",
  orangered: "#ff4500",
  orchid: "#da70d6",
  palegoldenrod: "#eee8aa",
  palegreen: "#98fb98",
  paleturquoise: "#afeeee",
  palevioletred: "#d87093",
  papayawhip: "#ffefd5",
  peachpuff: "#ffdab9",
  peru: "#cd853f",
  pink: "#ffc0cb",
  plum: "#dda0dd",
  powderblue: "#b0e0e6",
  purple: "#800080",
  red: "#ff0000",
  rebeccapurple: "#663399",
  rosybrown: "#bc8f8f",
  royalblue: "#4169e1",
  saddlebrown: "#8b4513",
  salmon: "#fa8072",
  sandybrown: "#f4a460",
  seagreen: "#2e8b57",
  seashell: "#fff5ee",
  sienna: "#a0522d",
  silver: "#c0c0c0",
  skyblue: "#87ceeb",
  slateblue: "#6a5acd",
  slategray: "#708090",
  slategrey: "#708090",
  snow: "#fffafa",
  springgreen: "#00ff7f",
  steelblue: "#4682b4",
  tan: "#d2b48c",
  teal: "#008080",
  thistle: "#d8bfd8",
  tomato: "#ff6347",
  turquoise: "#40e0d0",
  violet: "#ee82ee",
  wheat: "#f5deb3",
  white: "#ffffff",
  whitesmoke: "#f5f5f5",
  yellow: "#ffff00",
  yellowgreen: "#9acd32"
};
var colorKeywords = {
  "currentColor": "The value of the 'color' property. The computed value of the 'currentColor' keyword is the computed value of the 'color' property. If the 'currentColor' keyword is set on the 'color' property itself, it is treated as 'color:inherit' at parse time.",
  "transparent": "Fully transparent. This keyword can be considered a shorthand for rgba(0,0,0,0) which is its computed value."
};
function getNumericValue(node, factor) {
  var val = node.getText();
  var m = val.match(/^([-+]?[0-9]*\.?[0-9]+)(%?)$/);
  if (m) {
    if (m[2]) {
      factor = 100;
    }
    var result = parseFloat(m[1]) / factor;
    if (result >= 0 && result <= 1) {
      return result;
    }
  }
  throw new Error();
}
function getAngle(node) {
  var val = node.getText();
  var m = val.match(/^([-+]?[0-9]*\.?[0-9]+)(deg)?$/);
  if (m) {
    return parseFloat(val) % 360;
  }
  throw new Error();
}
function isColorConstructor(node) {
  var name = node.getName();
  if (!name) {
    return false;
  }
  return /^(rgb|rgba|hsl|hsla)$/gi.test(name);
}
var Digit0 = 48;
var Digit9 = 57;
var A = 65;
var a = 97;
var f = 102;
function hexDigit(charCode) {
  if (charCode < Digit0) {
    return 0;
  }
  if (charCode <= Digit9) {
    return charCode - Digit0;
  }
  if (charCode < a) {
    charCode += a - A;
  }
  if (charCode >= a && charCode <= f) {
    return charCode - a + 10;
  }
  return 0;
}
function colorFromHex(text) {
  if (text[0] !== "#") {
    return null;
  }
  switch (text.length) {
    case 4:
      return {
        red: hexDigit(text.charCodeAt(1)) * 17 / 255,
        green: hexDigit(text.charCodeAt(2)) * 17 / 255,
        blue: hexDigit(text.charCodeAt(3)) * 17 / 255,
        alpha: 1
      };
    case 5:
      return {
        red: hexDigit(text.charCodeAt(1)) * 17 / 255,
        green: hexDigit(text.charCodeAt(2)) * 17 / 255,
        blue: hexDigit(text.charCodeAt(3)) * 17 / 255,
        alpha: hexDigit(text.charCodeAt(4)) * 17 / 255
      };
    case 7:
      return {
        red: (hexDigit(text.charCodeAt(1)) * 16 + hexDigit(text.charCodeAt(2))) / 255,
        green: (hexDigit(text.charCodeAt(3)) * 16 + hexDigit(text.charCodeAt(4))) / 255,
        blue: (hexDigit(text.charCodeAt(5)) * 16 + hexDigit(text.charCodeAt(6))) / 255,
        alpha: 1
      };
    case 9:
      return {
        red: (hexDigit(text.charCodeAt(1)) * 16 + hexDigit(text.charCodeAt(2))) / 255,
        green: (hexDigit(text.charCodeAt(3)) * 16 + hexDigit(text.charCodeAt(4))) / 255,
        blue: (hexDigit(text.charCodeAt(5)) * 16 + hexDigit(text.charCodeAt(6))) / 255,
        alpha: (hexDigit(text.charCodeAt(7)) * 16 + hexDigit(text.charCodeAt(8))) / 255
      };
  }
  return null;
}
function colorFromHSL(hue, sat, light, alpha) {
  if (alpha === void 0) {
    alpha = 1;
  }
  hue = hue / 60;
  if (sat === 0) {
    return { red: light, green: light, blue: light, alpha };
  } else {
    var hueToRgb = function(t12, t22, hue2) {
      while (hue2 < 0) {
        hue2 += 6;
      }
      while (hue2 >= 6) {
        hue2 -= 6;
      }
      if (hue2 < 1) {
        return (t22 - t12) * hue2 + t12;
      }
      if (hue2 < 3) {
        return t22;
      }
      if (hue2 < 4) {
        return (t22 - t12) * (4 - hue2) + t12;
      }
      return t12;
    };
    var t2 = light <= 0.5 ? light * (sat + 1) : light + sat - light * sat;
    var t1 = light * 2 - t2;
    return { red: hueToRgb(t1, t2, hue + 2), green: hueToRgb(t1, t2, hue), blue: hueToRgb(t1, t2, hue - 2), alpha };
  }
}
function hslFromColor(rgba) {
  var r = rgba.red;
  var g = rgba.green;
  var b = rgba.blue;
  var a2 = rgba.alpha;
  var max = Math.max(r, g, b);
  var min = Math.min(r, g, b);
  var h = 0;
  var s = 0;
  var l = (min + max) / 2;
  var chroma = max - min;
  if (chroma > 0) {
    s = Math.min(l <= 0.5 ? chroma / (2 * l) : chroma / (2 - 2 * l), 1);
    switch (max) {
      case r:
        h = (g - b) / chroma + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / chroma + 2;
        break;
      case b:
        h = (r - g) / chroma + 4;
        break;
    }
    h *= 60;
    h = Math.round(h);
  }
  return { h, s, l, a: a2 };
}
function getColorValue(node) {
  if (node.type === NodeType.HexColorValue) {
    var text = node.getText();
    return colorFromHex(text);
  } else if (node.type === NodeType.Function) {
    var functionNode = node;
    var name = functionNode.getName();
    var colorValues = functionNode.getArguments().getChildren();
    if (!name || colorValues.length < 3 || colorValues.length > 4) {
      return null;
    }
    try {
      var alpha = colorValues.length === 4 ? getNumericValue(colorValues[3], 1) : 1;
      if (name === "rgb" || name === "rgba") {
        return {
          red: getNumericValue(colorValues[0], 255),
          green: getNumericValue(colorValues[1], 255),
          blue: getNumericValue(colorValues[2], 255),
          alpha
        };
      } else if (name === "hsl" || name === "hsla") {
        var h = getAngle(colorValues[0]);
        var s = getNumericValue(colorValues[1], 100);
        var l = getNumericValue(colorValues[2], 100);
        return colorFromHSL(h, s, l, alpha);
      }
    } catch (e) {
      return null;
    }
  } else if (node.type === NodeType.Identifier) {
    if (node.parent && node.parent.type !== NodeType.Term) {
      return null;
    }
    var term = node.parent;
    if (term && term.parent && term.parent.type === NodeType.BinaryExpression) {
      var expression = term.parent;
      if (expression.parent && expression.parent.type === NodeType.ListEntry && expression.parent.key === expression) {
        return null;
      }
    }
    var candidateColor = node.getText().toLowerCase();
    if (candidateColor === "none") {
      return null;
    }
    var colorHex = colors[candidateColor];
    if (colorHex) {
      return colorFromHex(colorHex);
    }
  }
  return null;
}
var positionKeywords = {
  "bottom": "Computes to \u2018100%\u2019 for the vertical position if one or two values are given, otherwise specifies the bottom edge as the origin for the next offset.",
  "center": "Computes to \u201850%\u2019 (\u2018left 50%\u2019) for the horizontal position if the horizontal position is not otherwise specified, or \u201850%\u2019 (\u2018top 50%\u2019) for the vertical position if it is.",
  "left": "Computes to \u20180%\u2019 for the horizontal position if one or two values are given, otherwise specifies the left edge as the origin for the next offset.",
  "right": "Computes to \u2018100%\u2019 for the horizontal position if one or two values are given, otherwise specifies the right edge as the origin for the next offset.",
  "top": "Computes to \u20180%\u2019 for the vertical position if one or two values are given, otherwise specifies the top edge as the origin for the next offset."
};
var repeatStyleKeywords = {
  "no-repeat": "Placed once and not repeated in this direction.",
  "repeat": "Repeated in this direction as often as needed to cover the background painting area.",
  "repeat-x": "Computes to \u2018repeat no-repeat\u2019.",
  "repeat-y": "Computes to \u2018no-repeat repeat\u2019.",
  "round": "Repeated as often as will fit within the background positioning area. If it doesn\u2019t fit a whole number of times, it is rescaled so that it does.",
  "space": "Repeated as often as will fit within the background positioning area without being clipped and then the images are spaced out to fill the area."
};
var lineStyleKeywords = {
  "dashed": "A series of square-ended dashes.",
  "dotted": "A series of round dots.",
  "double": "Two parallel solid lines with some space between them.",
  "groove": "Looks as if it were carved in the canvas.",
  "hidden": "Same as \u2018none\u2019, but has different behavior in the border conflict resolution rules for border-collapsed tables.",
  "inset": "Looks as if the content on the inside of the border is sunken into the canvas.",
  "none": "No border. Color and width are ignored.",
  "outset": "Looks as if the content on the inside of the border is coming out of the canvas.",
  "ridge": "Looks as if it were coming out of the canvas.",
  "solid": "A single line segment."
};
var lineWidthKeywords = ["medium", "thick", "thin"];
var boxKeywords = {
  "border-box": "The background is painted within (clipped to) the border box.",
  "content-box": "The background is painted within (clipped to) the content box.",
  "padding-box": "The background is painted within (clipped to) the padding box."
};
var geometryBoxKeywords = {
  "margin-box": "Uses the margin box as reference box.",
  "fill-box": "Uses the object bounding box as reference box.",
  "stroke-box": "Uses the stroke bounding box as reference box.",
  "view-box": "Uses the nearest SVG viewport as reference box."
};
var cssWideKeywords = {
  "initial": "Represents the value specified as the property\u2019s initial value.",
  "inherit": "Represents the computed value of the property on the element\u2019s parent.",
  "unset": "Acts as either `inherit` or `initial`, depending on whether the property is inherited or not."
};
var imageFunctions = {
  "url()": "Reference an image file by URL",
  "image()": "Provide image fallbacks and annotations.",
  "-webkit-image-set()": "Provide multiple resolutions. Remember to use unprefixed image-set() in addition.",
  "image-set()": "Provide multiple resolutions of an image and const the UA decide which is most appropriate in a given situation.",
  "-moz-element()": "Use an element in the document as an image. Remember to use unprefixed element() in addition.",
  "element()": "Use an element in the document as an image.",
  "cross-fade()": "Indicates the two images to be combined and how far along in the transition the combination is.",
  "-webkit-gradient()": "Deprecated. Use modern linear-gradient() or radial-gradient() instead.",
  "-webkit-linear-gradient()": "Linear gradient. Remember to use unprefixed version in addition.",
  "-moz-linear-gradient()": "Linear gradient. Remember to use unprefixed version in addition.",
  "-o-linear-gradient()": "Linear gradient. Remember to use unprefixed version in addition.",
  "linear-gradient()": "A linear gradient is created by specifying a straight gradient line, and then several colors placed along that line.",
  "-webkit-repeating-linear-gradient()": "Repeating Linear gradient. Remember to use unprefixed version in addition.",
  "-moz-repeating-linear-gradient()": "Repeating Linear gradient. Remember to use unprefixed version in addition.",
  "-o-repeating-linear-gradient()": "Repeating Linear gradient. Remember to use unprefixed version in addition.",
  "repeating-linear-gradient()": "Same as linear-gradient, except the color-stops are repeated infinitely in both directions, with their positions shifted by multiples of the difference between the last specified color-stop\u2019s position and the first specified color-stop\u2019s position.",
  "-webkit-radial-gradient()": "Radial gradient. Remember to use unprefixed version in addition.",
  "-moz-radial-gradient()": "Radial gradient. Remember to use unprefixed version in addition.",
  "radial-gradient()": "Colors emerge from a single point and smoothly spread outward in a circular or elliptical shape.",
  "-webkit-repeating-radial-gradient()": "Repeating radial gradient. Remember to use unprefixed version in addition.",
  "-moz-repeating-radial-gradient()": "Repeating radial gradient. Remember to use unprefixed version in addition.",
  "repeating-radial-gradient()": "Same as radial-gradient, except the color-stops are repeated infinitely in both directions, with their positions shifted by multiples of the difference between the last specified color-stop\u2019s position and the first specified color-stop\u2019s position."
};
var transitionTimingFunctions = {
  "ease": "Equivalent to cubic-bezier(0.25, 0.1, 0.25, 1.0).",
  "ease-in": "Equivalent to cubic-bezier(0.42, 0, 1.0, 1.0).",
  "ease-in-out": "Equivalent to cubic-bezier(0.42, 0, 0.58, 1.0).",
  "ease-out": "Equivalent to cubic-bezier(0, 0, 0.58, 1.0).",
  "linear": "Equivalent to cubic-bezier(0.0, 0.0, 1.0, 1.0).",
  "step-end": "Equivalent to steps(1, end).",
  "step-start": "Equivalent to steps(1, start).",
  "steps()": "The first parameter specifies the number of intervals in the function. The second parameter, which is optional, is either the value \u201Cstart\u201D or \u201Cend\u201D.",
  "cubic-bezier()": "Specifies a cubic-bezier curve. The four values specify points P1 and P2  of the curve as (x1, y1, x2, y2).",
  "cubic-bezier(0.6, -0.28, 0.735, 0.045)": "Ease-in Back. Overshoots.",
  "cubic-bezier(0.68, -0.55, 0.265, 1.55)": "Ease-in-out Back. Overshoots.",
  "cubic-bezier(0.175, 0.885, 0.32, 1.275)": "Ease-out Back. Overshoots.",
  "cubic-bezier(0.6, 0.04, 0.98, 0.335)": "Ease-in Circular. Based on half circle.",
  "cubic-bezier(0.785, 0.135, 0.15, 0.86)": "Ease-in-out Circular. Based on half circle.",
  "cubic-bezier(0.075, 0.82, 0.165, 1)": "Ease-out Circular. Based on half circle.",
  "cubic-bezier(0.55, 0.055, 0.675, 0.19)": "Ease-in Cubic. Based on power of three.",
  "cubic-bezier(0.645, 0.045, 0.355, 1)": "Ease-in-out Cubic. Based on power of three.",
  "cubic-bezier(0.215, 0.610, 0.355, 1)": "Ease-out Cubic. Based on power of three.",
  "cubic-bezier(0.95, 0.05, 0.795, 0.035)": "Ease-in Exponential. Based on two to the power ten.",
  "cubic-bezier(1, 0, 0, 1)": "Ease-in-out Exponential. Based on two to the power ten.",
  "cubic-bezier(0.19, 1, 0.22, 1)": "Ease-out Exponential. Based on two to the power ten.",
  "cubic-bezier(0.47, 0, 0.745, 0.715)": "Ease-in Sine.",
  "cubic-bezier(0.445, 0.05, 0.55, 0.95)": "Ease-in-out Sine.",
  "cubic-bezier(0.39, 0.575, 0.565, 1)": "Ease-out Sine.",
  "cubic-bezier(0.55, 0.085, 0.68, 0.53)": "Ease-in Quadratic. Based on power of two.",
  "cubic-bezier(0.455, 0.03, 0.515, 0.955)": "Ease-in-out Quadratic. Based on power of two.",
  "cubic-bezier(0.25, 0.46, 0.45, 0.94)": "Ease-out Quadratic. Based on power of two.",
  "cubic-bezier(0.895, 0.03, 0.685, 0.22)": "Ease-in Quartic. Based on power of four.",
  "cubic-bezier(0.77, 0, 0.175, 1)": "Ease-in-out Quartic. Based on power of four.",
  "cubic-bezier(0.165, 0.84, 0.44, 1)": "Ease-out Quartic. Based on power of four.",
  "cubic-bezier(0.755, 0.05, 0.855, 0.06)": "Ease-in Quintic. Based on power of five.",
  "cubic-bezier(0.86, 0, 0.07, 1)": "Ease-in-out Quintic. Based on power of five.",
  "cubic-bezier(0.23, 1, 0.320, 1)": "Ease-out Quintic. Based on power of five."
};
var basicShapeFunctions = {
  "circle()": "Defines a circle.",
  "ellipse()": "Defines an ellipse.",
  "inset()": "Defines an inset rectangle.",
  "polygon()": "Defines a polygon."
};
var units = {
  "length": ["em", "rem", "ex", "px", "cm", "mm", "in", "pt", "pc", "ch", "vw", "vh", "vmin", "vmax"],
  "angle": ["deg", "rad", "grad", "turn"],
  "time": ["ms", "s"],
  "frequency": ["Hz", "kHz"],
  "resolution": ["dpi", "dpcm", "dppx"],
  "percentage": ["%", "fr"]
};
var html5Tags = [
  "a",
  "abbr",
  "address",
  "area",
  "article",
  "aside",
  "audio",
  "b",
  "base",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "data",
  "datalist",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "embed",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "head",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "keygen",
  "label",
  "legend",
  "li",
  "link",
  "main",
  "map",
  "mark",
  "menu",
  "menuitem",
  "meta",
  "meter",
  "nav",
  "noscript",
  "object",
  "ol",
  "optgroup",
  "option",
  "output",
  "p",
  "param",
  "picture",
  "pre",
  "progress",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "script",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "style",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "track",
  "u",
  "ul",
  "const",
  "video",
  "wbr"
];
var svgElements = [
  "circle",
  "clipPath",
  "cursor",
  "defs",
  "desc",
  "ellipse",
  "feBlend",
  "feColorMatrix",
  "feComponentTransfer",
  "feComposite",
  "feConvolveMatrix",
  "feDiffuseLighting",
  "feDisplacementMap",
  "feDistantLight",
  "feDropShadow",
  "feFlood",
  "feFuncA",
  "feFuncB",
  "feFuncG",
  "feFuncR",
  "feGaussianBlur",
  "feImage",
  "feMerge",
  "feMergeNode",
  "feMorphology",
  "feOffset",
  "fePointLight",
  "feSpecularLighting",
  "feSpotLight",
  "feTile",
  "feTurbulence",
  "filter",
  "foreignObject",
  "g",
  "hatch",
  "hatchpath",
  "image",
  "line",
  "linearGradient",
  "marker",
  "mask",
  "mesh",
  "meshpatch",
  "meshrow",
  "metadata",
  "mpath",
  "path",
  "pattern",
  "polygon",
  "polyline",
  "radialGradient",
  "rect",
  "set",
  "solidcolor",
  "stop",
  "svg",
  "switch",
  "symbol",
  "text",
  "textPath",
  "tspan",
  "use",
  "view"
];
var pageBoxDirectives = [
  "@bottom-center",
  "@bottom-left",
  "@bottom-left-corner",
  "@bottom-right",
  "@bottom-right-corner",
  "@left-bottom",
  "@left-middle",
  "@left-top",
  "@right-bottom",
  "@right-middle",
  "@right-top",
  "@top-center",
  "@top-left",
  "@top-left-corner",
  "@top-right",
  "@top-right-corner"
];
function isDefined(obj) {
  return typeof obj !== "undefined";
}
var Parser = function() {
  function Parser2(scnr) {
    if (scnr === void 0) {
      scnr = new Scanner();
    }
    this.keyframeRegex = /^@(\-(webkit|ms|moz|o)\-)?keyframes$/i;
    this.scanner = scnr;
    this.token = { type: TokenType.EOF, offset: -1, len: 0, text: "" };
    this.prevToken = void 0;
  }
  Parser2.prototype.peekIdent = function(text) {
    return TokenType.Ident === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
  };
  Parser2.prototype.peekKeyword = function(text) {
    return TokenType.AtKeyword === this.token.type && text.length === this.token.text.length && text === this.token.text.toLowerCase();
  };
  Parser2.prototype.peekDelim = function(text) {
    return TokenType.Delim === this.token.type && text === this.token.text;
  };
  Parser2.prototype.peek = function(type) {
    return type === this.token.type;
  };
  Parser2.prototype.peekOne = function(types) {
    return types.indexOf(this.token.type) !== -1;
  };
  Parser2.prototype.peekRegExp = function(type, regEx) {
    if (type !== this.token.type) {
      return false;
    }
    return regEx.test(this.token.text);
  };
  Parser2.prototype.hasWhitespace = function() {
    return !!this.prevToken && this.prevToken.offset + this.prevToken.len !== this.token.offset;
  };
  Parser2.prototype.consumeToken = function() {
    this.prevToken = this.token;
    this.token = this.scanner.scan();
  };
  Parser2.prototype.mark = function() {
    return {
      prev: this.prevToken,
      curr: this.token,
      pos: this.scanner.pos()
    };
  };
  Parser2.prototype.restoreAtMark = function(mark) {
    this.prevToken = mark.prev;
    this.token = mark.curr;
    this.scanner.goBackTo(mark.pos);
  };
  Parser2.prototype.try = function(func) {
    var pos = this.mark();
    var node = func();
    if (!node) {
      this.restoreAtMark(pos);
      return null;
    }
    return node;
  };
  Parser2.prototype.acceptOneKeyword = function(keywords) {
    if (TokenType.AtKeyword === this.token.type) {
      for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
        var keyword = keywords_1[_i];
        if (keyword.length === this.token.text.length && keyword === this.token.text.toLowerCase()) {
          this.consumeToken();
          return true;
        }
      }
    }
    return false;
  };
  Parser2.prototype.accept = function(type) {
    if (type === this.token.type) {
      this.consumeToken();
      return true;
    }
    return false;
  };
  Parser2.prototype.acceptIdent = function(text) {
    if (this.peekIdent(text)) {
      this.consumeToken();
      return true;
    }
    return false;
  };
  Parser2.prototype.acceptKeyword = function(text) {
    if (this.peekKeyword(text)) {
      this.consumeToken();
      return true;
    }
    return false;
  };
  Parser2.prototype.acceptDelim = function(text) {
    if (this.peekDelim(text)) {
      this.consumeToken();
      return true;
    }
    return false;
  };
  Parser2.prototype.acceptRegexp = function(regEx) {
    if (regEx.test(this.token.text)) {
      this.consumeToken();
      return true;
    }
    return false;
  };
  Parser2.prototype._parseRegexp = function(regEx) {
    var node = this.createNode(NodeType.Identifier);
    do {
    } while (this.acceptRegexp(regEx));
    return this.finish(node);
  };
  Parser2.prototype.acceptUnquotedString = function() {
    var pos = this.scanner.pos();
    this.scanner.goBackTo(this.token.offset);
    var unquoted = this.scanner.scanUnquotedString();
    if (unquoted) {
      this.token = unquoted;
      this.consumeToken();
      return true;
    }
    this.scanner.goBackTo(pos);
    return false;
  };
  Parser2.prototype.resync = function(resyncTokens, resyncStopTokens) {
    while (true) {
      if (resyncTokens && resyncTokens.indexOf(this.token.type) !== -1) {
        this.consumeToken();
        return true;
      } else if (resyncStopTokens && resyncStopTokens.indexOf(this.token.type) !== -1) {
        return true;
      } else {
        if (this.token.type === TokenType.EOF) {
          return false;
        }
        this.token = this.scanner.scan();
      }
    }
  };
  Parser2.prototype.createNode = function(nodeType) {
    return new Node(this.token.offset, this.token.len, nodeType);
  };
  Parser2.prototype.create = function(ctor) {
    return new ctor(this.token.offset, this.token.len);
  };
  Parser2.prototype.finish = function(node, error, resyncTokens, resyncStopTokens) {
    if (!(node instanceof Nodelist)) {
      if (error) {
        this.markError(node, error, resyncTokens, resyncStopTokens);
      }
      if (this.prevToken) {
        var prevEnd = this.prevToken.offset + this.prevToken.len;
        node.length = prevEnd > node.offset ? prevEnd - node.offset : 0;
      }
    }
    return node;
  };
  Parser2.prototype.markError = function(node, error, resyncTokens, resyncStopTokens) {
    if (this.token !== this.lastErrorToken) {
      node.addIssue(new Marker(node, error, Level.Error, void 0, this.token.offset, this.token.len));
      this.lastErrorToken = this.token;
    }
    if (resyncTokens || resyncStopTokens) {
      this.resync(resyncTokens, resyncStopTokens);
    }
  };
  Parser2.prototype.parseStylesheet = function(textDocument) {
    var versionId = textDocument.version;
    var text = textDocument.getText();
    var textProvider = function(offset, length) {
      if (textDocument.version !== versionId) {
        throw new Error("Underlying model has changed, AST is no longer valid");
      }
      return text.substr(offset, length);
    };
    return this.internalParse(text, this._parseStylesheet, textProvider);
  };
  Parser2.prototype.internalParse = function(input, parseFunc, textProvider) {
    this.scanner.setSource(input);
    this.token = this.scanner.scan();
    var node = parseFunc.bind(this)();
    if (node) {
      if (textProvider) {
        node.textProvider = textProvider;
      } else {
        node.textProvider = function(offset, length) {
          return input.substr(offset, length);
        };
      }
    }
    return node;
  };
  Parser2.prototype._parseStylesheet = function() {
    var node = this.create(Stylesheet);
    while (node.addChild(this._parseStylesheetStart())) {
    }
    var inRecovery = false;
    do {
      var hasMatch = false;
      do {
        hasMatch = false;
        var statement = this._parseStylesheetStatement();
        if (statement) {
          node.addChild(statement);
          hasMatch = true;
          inRecovery = false;
          if (!this.peek(TokenType.EOF) && this._needsSemicolonAfter(statement) && !this.accept(TokenType.SemiColon)) {
            this.markError(node, ParseError.SemiColonExpected);
          }
        }
        while (this.accept(TokenType.SemiColon) || this.accept(TokenType.CDO) || this.accept(TokenType.CDC)) {
          hasMatch = true;
          inRecovery = false;
        }
      } while (hasMatch);
      if (this.peek(TokenType.EOF)) {
        break;
      }
      if (!inRecovery) {
        if (this.peek(TokenType.AtKeyword)) {
          this.markError(node, ParseError.UnknownAtRule);
        } else {
          this.markError(node, ParseError.RuleOrSelectorExpected);
        }
        inRecovery = true;
      }
      this.consumeToken();
    } while (!this.peek(TokenType.EOF));
    return this.finish(node);
  };
  Parser2.prototype._parseStylesheetStart = function() {
    return this._parseCharset();
  };
  Parser2.prototype._parseStylesheetStatement = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (this.peek(TokenType.AtKeyword)) {
      return this._parseStylesheetAtStatement(isNested);
    }
    return this._parseRuleset(isNested);
  };
  Parser2.prototype._parseStylesheetAtStatement = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    return this._parseImport() || this._parseMedia(isNested) || this._parsePage() || this._parseFontFace() || this._parseKeyframe() || this._parseSupports(isNested) || this._parseViewPort() || this._parseNamespace() || this._parseDocument() || this._parseUnknownAtRule();
  };
  Parser2.prototype._tryParseRuleset = function(isNested) {
    var mark = this.mark();
    if (this._parseSelector(isNested)) {
      while (this.accept(TokenType.Comma) && this._parseSelector(isNested)) {
      }
      if (this.accept(TokenType.CurlyL)) {
        this.restoreAtMark(mark);
        return this._parseRuleset(isNested);
      }
    }
    this.restoreAtMark(mark);
    return null;
  };
  Parser2.prototype._parseRuleset = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    var node = this.create(RuleSet);
    var selectors = node.getSelectors();
    if (!selectors.addChild(this._parseSelector(isNested))) {
      return null;
    }
    while (this.accept(TokenType.Comma)) {
      if (!selectors.addChild(this._parseSelector(isNested))) {
        return this.finish(node, ParseError.SelectorExpected);
      }
    }
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  Parser2.prototype._parseRuleSetDeclarationAtStatement = function() {
    return this._parseUnknownAtRule();
  };
  Parser2.prototype._parseRuleSetDeclaration = function() {
    if (this.peek(TokenType.AtKeyword)) {
      return this._parseRuleSetDeclarationAtStatement();
    }
    return this._parseDeclaration();
  };
  Parser2.prototype._needsSemicolonAfter = function(node) {
    switch (node.type) {
      case NodeType.Keyframe:
      case NodeType.ViewPort:
      case NodeType.Media:
      case NodeType.Ruleset:
      case NodeType.Namespace:
      case NodeType.If:
      case NodeType.For:
      case NodeType.Each:
      case NodeType.While:
      case NodeType.MixinDeclaration:
      case NodeType.FunctionDeclaration:
      case NodeType.MixinContentDeclaration:
        return false;
      case NodeType.ExtendsReference:
      case NodeType.MixinContentReference:
      case NodeType.ReturnStatement:
      case NodeType.MediaQuery:
      case NodeType.Debug:
      case NodeType.Import:
      case NodeType.AtApplyRule:
      case NodeType.CustomPropertyDeclaration:
        return true;
      case NodeType.VariableDeclaration:
        return node.needsSemicolon;
      case NodeType.MixinReference:
        return !node.getContent();
      case NodeType.Declaration:
        return !node.getNestedProperties();
    }
    return false;
  };
  Parser2.prototype._parseDeclarations = function(parseDeclaration) {
    var node = this.create(Declarations);
    if (!this.accept(TokenType.CurlyL)) {
      return null;
    }
    var decl = parseDeclaration();
    while (node.addChild(decl)) {
      if (this.peek(TokenType.CurlyR)) {
        break;
      }
      if (this._needsSemicolonAfter(decl) && !this.accept(TokenType.SemiColon)) {
        return this.finish(node, ParseError.SemiColonExpected, [TokenType.SemiColon, TokenType.CurlyR]);
      }
      if (decl && this.prevToken && this.prevToken.type === TokenType.SemiColon) {
        decl.semicolonPosition = this.prevToken.offset;
      }
      while (this.accept(TokenType.SemiColon)) {
      }
      decl = parseDeclaration();
    }
    if (!this.accept(TokenType.CurlyR)) {
      return this.finish(node, ParseError.RightCurlyExpected, [TokenType.CurlyR, TokenType.SemiColon]);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseBody = function(node, parseDeclaration) {
    if (!node.setDeclarations(this._parseDeclarations(parseDeclaration))) {
      return this.finish(node, ParseError.LeftCurlyExpected, [TokenType.CurlyR, TokenType.SemiColon]);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseSelector = function(isNested) {
    var node = this.create(Selector);
    var hasContent = false;
    if (isNested) {
      hasContent = node.addChild(this._parseCombinator());
    }
    while (node.addChild(this._parseSimpleSelector())) {
      hasContent = true;
      node.addChild(this._parseCombinator());
    }
    return hasContent ? this.finish(node) : null;
  };
  Parser2.prototype._parseDeclaration = function(stopTokens) {
    var custonProperty = this._tryParseCustomPropertyDeclaration(stopTokens);
    if (custonProperty) {
      return custonProperty;
    }
    var node = this.create(Declaration);
    if (!node.setProperty(this._parseProperty())) {
      return null;
    }
    if (!this.accept(TokenType.Colon)) {
      return this.finish(node, ParseError.ColonExpected, [TokenType.Colon], stopTokens || [TokenType.SemiColon]);
    }
    if (this.prevToken) {
      node.colonPosition = this.prevToken.offset;
    }
    if (!node.setValue(this._parseExpr())) {
      return this.finish(node, ParseError.PropertyValueExpected);
    }
    node.addChild(this._parsePrio());
    if (this.peek(TokenType.SemiColon)) {
      node.semicolonPosition = this.token.offset;
    }
    return this.finish(node);
  };
  Parser2.prototype._tryParseCustomPropertyDeclaration = function(stopTokens) {
    if (!this.peekRegExp(TokenType.Ident, /^--/)) {
      return null;
    }
    var node = this.create(CustomPropertyDeclaration);
    if (!node.setProperty(this._parseProperty())) {
      return null;
    }
    if (!this.accept(TokenType.Colon)) {
      return this.finish(node, ParseError.ColonExpected, [TokenType.Colon]);
    }
    if (this.prevToken) {
      node.colonPosition = this.prevToken.offset;
    }
    var mark = this.mark();
    if (this.peek(TokenType.CurlyL)) {
      var propertySet = this.create(CustomPropertySet);
      var declarations = this._parseDeclarations(this._parseRuleSetDeclaration.bind(this));
      if (propertySet.setDeclarations(declarations) && !declarations.isErroneous(true)) {
        propertySet.addChild(this._parsePrio());
        if (this.peek(TokenType.SemiColon)) {
          this.finish(propertySet);
          node.setPropertySet(propertySet);
          node.semicolonPosition = this.token.offset;
          return this.finish(node);
        }
      }
      this.restoreAtMark(mark);
    }
    var expression = this._parseExpr();
    if (expression && !expression.isErroneous(true)) {
      this._parsePrio();
      if (this.peekOne(stopTokens || [TokenType.SemiColon])) {
        node.setValue(expression);
        node.semicolonPosition = this.token.offset;
        return this.finish(node);
      }
    }
    this.restoreAtMark(mark);
    node.addChild(this._parseCustomPropertyValue(stopTokens));
    node.addChild(this._parsePrio());
    if (isDefined(node.colonPosition) && this.token.offset === node.colonPosition + 1) {
      return this.finish(node, ParseError.PropertyValueExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseCustomPropertyValue = function(stopTokens) {
    var _this = this;
    if (stopTokens === void 0) {
      stopTokens = [TokenType.CurlyR];
    }
    var node = this.create(Node);
    var isTopLevel = function() {
      return curlyDepth === 0 && parensDepth === 0 && bracketsDepth === 0;
    };
    var onStopToken = function() {
      return stopTokens.indexOf(_this.token.type) !== -1;
    };
    var curlyDepth = 0;
    var parensDepth = 0;
    var bracketsDepth = 0;
    done:
      while (true) {
        switch (this.token.type) {
          case TokenType.SemiColon:
            if (isTopLevel()) {
              break done;
            }
            break;
          case TokenType.Exclamation:
            if (isTopLevel()) {
              break done;
            }
            break;
          case TokenType.CurlyL:
            curlyDepth++;
            break;
          case TokenType.CurlyR:
            curlyDepth--;
            if (curlyDepth < 0) {
              if (onStopToken() && parensDepth === 0 && bracketsDepth === 0) {
                break done;
              }
              return this.finish(node, ParseError.LeftCurlyExpected);
            }
            break;
          case TokenType.ParenthesisL:
            parensDepth++;
            break;
          case TokenType.ParenthesisR:
            parensDepth--;
            if (parensDepth < 0) {
              if (onStopToken() && bracketsDepth === 0 && curlyDepth === 0) {
                break done;
              }
              return this.finish(node, ParseError.LeftParenthesisExpected);
            }
            break;
          case TokenType.BracketL:
            bracketsDepth++;
            break;
          case TokenType.BracketR:
            bracketsDepth--;
            if (bracketsDepth < 0) {
              return this.finish(node, ParseError.LeftSquareBracketExpected);
            }
            break;
          case TokenType.BadString:
            break done;
          case TokenType.EOF:
            var error = ParseError.RightCurlyExpected;
            if (bracketsDepth > 0) {
              error = ParseError.RightSquareBracketExpected;
            } else if (parensDepth > 0) {
              error = ParseError.RightParenthesisExpected;
            }
            return this.finish(node, error);
        }
        this.consumeToken();
      }
    return this.finish(node);
  };
  Parser2.prototype._tryToParseDeclaration = function(stopTokens) {
    var mark = this.mark();
    if (this._parseProperty() && this.accept(TokenType.Colon)) {
      this.restoreAtMark(mark);
      return this._parseDeclaration(stopTokens);
    }
    this.restoreAtMark(mark);
    return null;
  };
  Parser2.prototype._parseProperty = function() {
    var node = this.create(Property);
    var mark = this.mark();
    if (this.acceptDelim("*") || this.acceptDelim("_")) {
      if (this.hasWhitespace()) {
        this.restoreAtMark(mark);
        return null;
      }
    }
    if (node.setIdentifier(this._parsePropertyIdentifier())) {
      return this.finish(node);
    }
    return null;
  };
  Parser2.prototype._parsePropertyIdentifier = function() {
    return this._parseIdent();
  };
  Parser2.prototype._parseCharset = function() {
    if (!this.peek(TokenType.Charset)) {
      return null;
    }
    var node = this.create(Node);
    this.consumeToken();
    if (!this.accept(TokenType.String)) {
      return this.finish(node, ParseError.IdentifierExpected);
    }
    if (!this.accept(TokenType.SemiColon)) {
      return this.finish(node, ParseError.SemiColonExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseImport = function() {
    if (!this.peekKeyword("@import")) {
      return null;
    }
    var node = this.create(Import);
    this.consumeToken();
    if (!node.addChild(this._parseURILiteral()) && !node.addChild(this._parseStringLiteral())) {
      return this.finish(node, ParseError.URIOrStringExpected);
    }
    if (!this.peek(TokenType.SemiColon) && !this.peek(TokenType.EOF)) {
      node.setMedialist(this._parseMediaQueryList());
    }
    return this.finish(node);
  };
  Parser2.prototype._parseNamespace = function() {
    if (!this.peekKeyword("@namespace")) {
      return null;
    }
    var node = this.create(Namespace);
    this.consumeToken();
    if (!node.addChild(this._parseURILiteral())) {
      node.addChild(this._parseIdent());
      if (!node.addChild(this._parseURILiteral()) && !node.addChild(this._parseStringLiteral())) {
        return this.finish(node, ParseError.URIExpected, [TokenType.SemiColon]);
      }
    }
    if (!this.accept(TokenType.SemiColon)) {
      return this.finish(node, ParseError.SemiColonExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseFontFace = function() {
    if (!this.peekKeyword("@font-face")) {
      return null;
    }
    var node = this.create(FontFace);
    this.consumeToken();
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  Parser2.prototype._parseViewPort = function() {
    if (!this.peekKeyword("@-ms-viewport") && !this.peekKeyword("@-o-viewport") && !this.peekKeyword("@viewport")) {
      return null;
    }
    var node = this.create(ViewPort);
    this.consumeToken();
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  Parser2.prototype._parseKeyframe = function() {
    if (!this.peekRegExp(TokenType.AtKeyword, this.keyframeRegex)) {
      return null;
    }
    var node = this.create(Keyframe);
    var atNode = this.create(Node);
    this.consumeToken();
    node.setKeyword(this.finish(atNode));
    if (atNode.matches("@-ms-keyframes")) {
      this.markError(atNode, ParseError.UnknownKeyword);
    }
    if (!node.setIdentifier(this._parseKeyframeIdent())) {
      return this.finish(node, ParseError.IdentifierExpected, [TokenType.CurlyR]);
    }
    return this._parseBody(node, this._parseKeyframeSelector.bind(this));
  };
  Parser2.prototype._parseKeyframeIdent = function() {
    return this._parseIdent([ReferenceType.Keyframe]);
  };
  Parser2.prototype._parseKeyframeSelector = function() {
    var node = this.create(KeyframeSelector);
    if (!node.addChild(this._parseIdent()) && !this.accept(TokenType.Percentage)) {
      return null;
    }
    while (this.accept(TokenType.Comma)) {
      if (!node.addChild(this._parseIdent()) && !this.accept(TokenType.Percentage)) {
        return this.finish(node, ParseError.PercentageExpected);
      }
    }
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  Parser2.prototype._tryParseKeyframeSelector = function() {
    var node = this.create(KeyframeSelector);
    var pos = this.mark();
    if (!node.addChild(this._parseIdent()) && !this.accept(TokenType.Percentage)) {
      return null;
    }
    while (this.accept(TokenType.Comma)) {
      if (!node.addChild(this._parseIdent()) && !this.accept(TokenType.Percentage)) {
        this.restoreAtMark(pos);
        return null;
      }
    }
    if (!this.peek(TokenType.CurlyL)) {
      this.restoreAtMark(pos);
      return null;
    }
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  Parser2.prototype._parseSupports = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (!this.peekKeyword("@supports")) {
      return null;
    }
    var node = this.create(Supports);
    this.consumeToken();
    node.addChild(this._parseSupportsCondition());
    return this._parseBody(node, this._parseSupportsDeclaration.bind(this, isNested));
  };
  Parser2.prototype._parseSupportsDeclaration = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (isNested) {
      return this._tryParseRuleset(true) || this._tryToParseDeclaration() || this._parseStylesheetStatement(true);
    }
    return this._parseStylesheetStatement(false);
  };
  Parser2.prototype._parseSupportsCondition = function() {
    var node = this.create(SupportsCondition);
    if (this.acceptIdent("not")) {
      node.addChild(this._parseSupportsConditionInParens());
    } else {
      node.addChild(this._parseSupportsConditionInParens());
      if (this.peekRegExp(TokenType.Ident, /^(and|or)$/i)) {
        var text = this.token.text.toLowerCase();
        while (this.acceptIdent(text)) {
          node.addChild(this._parseSupportsConditionInParens());
        }
      }
    }
    return this.finish(node);
  };
  Parser2.prototype._parseSupportsConditionInParens = function() {
    var node = this.create(SupportsCondition);
    if (this.accept(TokenType.ParenthesisL)) {
      if (this.prevToken) {
        node.lParent = this.prevToken.offset;
      }
      if (!node.addChild(this._tryToParseDeclaration([TokenType.ParenthesisR]))) {
        if (!this._parseSupportsCondition()) {
          return this.finish(node, ParseError.ConditionExpected);
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected, [TokenType.ParenthesisR], []);
      }
      if (this.prevToken) {
        node.rParent = this.prevToken.offset;
      }
      return this.finish(node);
    } else if (this.peek(TokenType.Ident)) {
      var pos = this.mark();
      this.consumeToken();
      if (!this.hasWhitespace() && this.accept(TokenType.ParenthesisL)) {
        var openParentCount = 1;
        while (this.token.type !== TokenType.EOF && openParentCount !== 0) {
          if (this.token.type === TokenType.ParenthesisL) {
            openParentCount++;
          } else if (this.token.type === TokenType.ParenthesisR) {
            openParentCount--;
          }
          this.consumeToken();
        }
        return this.finish(node);
      } else {
        this.restoreAtMark(pos);
      }
    }
    return this.finish(node, ParseError.LeftParenthesisExpected, [], [TokenType.ParenthesisL]);
  };
  Parser2.prototype._parseMediaDeclaration = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (isNested) {
      return this._tryParseRuleset(true) || this._tryToParseDeclaration() || this._parseStylesheetStatement(true);
    }
    return this._parseStylesheetStatement(false);
  };
  Parser2.prototype._parseMedia = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (!this.peekKeyword("@media")) {
      return null;
    }
    var node = this.create(Media);
    this.consumeToken();
    if (!node.addChild(this._parseMediaQueryList())) {
      return this.finish(node, ParseError.MediaQueryExpected);
    }
    return this._parseBody(node, this._parseMediaDeclaration.bind(this, isNested));
  };
  Parser2.prototype._parseMediaQueryList = function() {
    var node = this.create(Medialist);
    if (!node.addChild(this._parseMediaQuery([TokenType.CurlyL]))) {
      return this.finish(node, ParseError.MediaQueryExpected);
    }
    while (this.accept(TokenType.Comma)) {
      if (!node.addChild(this._parseMediaQuery([TokenType.CurlyL]))) {
        return this.finish(node, ParseError.MediaQueryExpected);
      }
    }
    return this.finish(node);
  };
  Parser2.prototype._parseMediaQuery = function(resyncStopToken) {
    var node = this.create(MediaQuery);
    var parseExpression = true;
    var hasContent = false;
    if (!this.peek(TokenType.ParenthesisL)) {
      if (this.acceptIdent("only") || this.acceptIdent("not"))
        ;
      if (!node.addChild(this._parseIdent())) {
        return null;
      }
      hasContent = true;
      parseExpression = this.acceptIdent("and");
    }
    while (parseExpression) {
      if (node.addChild(this._parseMediaContentStart())) {
        parseExpression = this.acceptIdent("and");
        continue;
      }
      if (!this.accept(TokenType.ParenthesisL)) {
        if (hasContent) {
          return this.finish(node, ParseError.LeftParenthesisExpected, [], resyncStopToken);
        }
        return null;
      }
      if (!node.addChild(this._parseMediaFeatureName())) {
        return this.finish(node, ParseError.IdentifierExpected, [], resyncStopToken);
      }
      if (this.accept(TokenType.Colon)) {
        if (!node.addChild(this._parseExpr())) {
          return this.finish(node, ParseError.TermExpected, [], resyncStopToken);
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected, [], resyncStopToken);
      }
      parseExpression = this.acceptIdent("and");
    }
    return this.finish(node);
  };
  Parser2.prototype._parseMediaContentStart = function() {
    return null;
  };
  Parser2.prototype._parseMediaFeatureName = function() {
    return this._parseIdent();
  };
  Parser2.prototype._parseMedium = function() {
    var node = this.create(Node);
    if (node.addChild(this._parseIdent())) {
      return this.finish(node);
    } else {
      return null;
    }
  };
  Parser2.prototype._parsePageDeclaration = function() {
    return this._parsePageMarginBox() || this._parseRuleSetDeclaration();
  };
  Parser2.prototype._parsePage = function() {
    if (!this.peekKeyword("@page")) {
      return null;
    }
    var node = this.create(Page);
    this.consumeToken();
    if (node.addChild(this._parsePageSelector())) {
      while (this.accept(TokenType.Comma)) {
        if (!node.addChild(this._parsePageSelector())) {
          return this.finish(node, ParseError.IdentifierExpected);
        }
      }
    }
    return this._parseBody(node, this._parsePageDeclaration.bind(this));
  };
  Parser2.prototype._parsePageMarginBox = function() {
    if (!this.peek(TokenType.AtKeyword)) {
      return null;
    }
    var node = this.create(PageBoxMarginBox);
    if (!this.acceptOneKeyword(pageBoxDirectives)) {
      this.markError(node, ParseError.UnknownAtRule, [], [TokenType.CurlyL]);
    }
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  Parser2.prototype._parsePageSelector = function() {
    if (!this.peek(TokenType.Ident) && !this.peek(TokenType.Colon)) {
      return null;
    }
    var node = this.create(Node);
    node.addChild(this._parseIdent());
    if (this.accept(TokenType.Colon)) {
      if (!node.addChild(this._parseIdent())) {
        return this.finish(node, ParseError.IdentifierExpected);
      }
    }
    return this.finish(node);
  };
  Parser2.prototype._parseDocument = function() {
    if (!this.peekKeyword("@-moz-document")) {
      return null;
    }
    var node = this.create(Document);
    this.consumeToken();
    this.resync([], [TokenType.CurlyL]);
    return this._parseBody(node, this._parseStylesheetStatement.bind(this));
  };
  Parser2.prototype._parseUnknownAtRule = function() {
    if (!this.peek(TokenType.AtKeyword)) {
      return null;
    }
    var node = this.create(UnknownAtRule);
    node.addChild(this._parseUnknownAtRuleName());
    var isTopLevel = function() {
      return curlyDepth === 0 && parensDepth === 0 && bracketsDepth === 0;
    };
    var curlyLCount = 0;
    var curlyDepth = 0;
    var parensDepth = 0;
    var bracketsDepth = 0;
    done:
      while (true) {
        switch (this.token.type) {
          case TokenType.SemiColon:
            if (isTopLevel()) {
              break done;
            }
            break;
          case TokenType.EOF:
            if (curlyDepth > 0) {
              return this.finish(node, ParseError.RightCurlyExpected);
            } else if (bracketsDepth > 0) {
              return this.finish(node, ParseError.RightSquareBracketExpected);
            } else if (parensDepth > 0) {
              return this.finish(node, ParseError.RightParenthesisExpected);
            } else {
              return this.finish(node);
            }
          case TokenType.CurlyL:
            curlyLCount++;
            curlyDepth++;
            break;
          case TokenType.CurlyR:
            curlyDepth--;
            if (curlyLCount > 0 && curlyDepth === 0) {
              this.consumeToken();
              if (bracketsDepth > 0) {
                return this.finish(node, ParseError.RightSquareBracketExpected);
              } else if (parensDepth > 0) {
                return this.finish(node, ParseError.RightParenthesisExpected);
              }
              break done;
            }
            if (curlyDepth < 0) {
              if (parensDepth === 0 && bracketsDepth === 0) {
                break done;
              }
              return this.finish(node, ParseError.LeftCurlyExpected);
            }
            break;
          case TokenType.ParenthesisL:
            parensDepth++;
            break;
          case TokenType.ParenthesisR:
            parensDepth--;
            if (parensDepth < 0) {
              return this.finish(node, ParseError.LeftParenthesisExpected);
            }
            break;
          case TokenType.BracketL:
            bracketsDepth++;
            break;
          case TokenType.BracketR:
            bracketsDepth--;
            if (bracketsDepth < 0) {
              return this.finish(node, ParseError.LeftSquareBracketExpected);
            }
            break;
        }
        this.consumeToken();
      }
    return node;
  };
  Parser2.prototype._parseUnknownAtRuleName = function() {
    var node = this.create(Node);
    if (this.accept(TokenType.AtKeyword)) {
      return this.finish(node);
    }
    return node;
  };
  Parser2.prototype._parseOperator = function() {
    if (this.peekDelim("/") || this.peekDelim("*") || this.peekDelim("+") || this.peekDelim("-") || this.peek(TokenType.Dashmatch) || this.peek(TokenType.Includes) || this.peek(TokenType.SubstringOperator) || this.peek(TokenType.PrefixOperator) || this.peek(TokenType.SuffixOperator) || this.peekDelim("=")) {
      var node = this.createNode(NodeType.Operator);
      this.consumeToken();
      return this.finish(node);
    } else {
      return null;
    }
  };
  Parser2.prototype._parseUnaryOperator = function() {
    if (!this.peekDelim("+") && !this.peekDelim("-")) {
      return null;
    }
    var node = this.create(Node);
    this.consumeToken();
    return this.finish(node);
  };
  Parser2.prototype._parseCombinator = function() {
    if (this.peekDelim(">")) {
      var node = this.create(Node);
      this.consumeToken();
      var mark = this.mark();
      if (!this.hasWhitespace() && this.acceptDelim(">")) {
        if (!this.hasWhitespace() && this.acceptDelim(">")) {
          node.type = NodeType.SelectorCombinatorShadowPiercingDescendant;
          return this.finish(node);
        }
        this.restoreAtMark(mark);
      }
      node.type = NodeType.SelectorCombinatorParent;
      return this.finish(node);
    } else if (this.peekDelim("+")) {
      var node = this.create(Node);
      this.consumeToken();
      node.type = NodeType.SelectorCombinatorSibling;
      return this.finish(node);
    } else if (this.peekDelim("~")) {
      var node = this.create(Node);
      this.consumeToken();
      node.type = NodeType.SelectorCombinatorAllSiblings;
      return this.finish(node);
    } else if (this.peekDelim("/")) {
      var node = this.create(Node);
      this.consumeToken();
      var mark = this.mark();
      if (!this.hasWhitespace() && this.acceptIdent("deep") && !this.hasWhitespace() && this.acceptDelim("/")) {
        node.type = NodeType.SelectorCombinatorShadowPiercingDescendant;
        return this.finish(node);
      }
      this.restoreAtMark(mark);
    }
    return null;
  };
  Parser2.prototype._parseSimpleSelector = function() {
    var node = this.create(SimpleSelector);
    var c = 0;
    if (node.addChild(this._parseElementName())) {
      c++;
    }
    while ((c === 0 || !this.hasWhitespace()) && node.addChild(this._parseSimpleSelectorBody())) {
      c++;
    }
    return c > 0 ? this.finish(node) : null;
  };
  Parser2.prototype._parseSimpleSelectorBody = function() {
    return this._parsePseudo() || this._parseHash() || this._parseClass() || this._parseAttrib();
  };
  Parser2.prototype._parseSelectorIdent = function() {
    return this._parseIdent();
  };
  Parser2.prototype._parseHash = function() {
    if (!this.peek(TokenType.Hash) && !this.peekDelim("#")) {
      return null;
    }
    var node = this.createNode(NodeType.IdentifierSelector);
    if (this.acceptDelim("#")) {
      if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
        return this.finish(node, ParseError.IdentifierExpected);
      }
    } else {
      this.consumeToken();
    }
    return this.finish(node);
  };
  Parser2.prototype._parseClass = function() {
    if (!this.peekDelim(".")) {
      return null;
    }
    var node = this.createNode(NodeType.ClassSelector);
    this.consumeToken();
    if (this.hasWhitespace() || !node.addChild(this._parseSelectorIdent())) {
      return this.finish(node, ParseError.IdentifierExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseElementName = function() {
    var pos = this.mark();
    var node = this.createNode(NodeType.ElementNameSelector);
    node.addChild(this._parseNamespacePrefix());
    if (!node.addChild(this._parseSelectorIdent()) && !this.acceptDelim("*")) {
      this.restoreAtMark(pos);
      return null;
    }
    return this.finish(node);
  };
  Parser2.prototype._parseNamespacePrefix = function() {
    var pos = this.mark();
    var node = this.createNode(NodeType.NamespacePrefix);
    if (!node.addChild(this._parseIdent()) && !this.acceptDelim("*"))
      ;
    if (!this.acceptDelim("|")) {
      this.restoreAtMark(pos);
      return null;
    }
    return this.finish(node);
  };
  Parser2.prototype._parseAttrib = function() {
    if (!this.peek(TokenType.BracketL)) {
      return null;
    }
    var node = this.create(AttributeSelector);
    this.consumeToken();
    node.setNamespacePrefix(this._parseNamespacePrefix());
    if (!node.setIdentifier(this._parseIdent())) {
      return this.finish(node, ParseError.IdentifierExpected);
    }
    if (node.setOperator(this._parseOperator())) {
      node.setValue(this._parseBinaryExpr());
      this.acceptIdent("i");
    }
    if (!this.accept(TokenType.BracketR)) {
      return this.finish(node, ParseError.RightSquareBracketExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parsePseudo = function() {
    var _this = this;
    var node = this._tryParsePseudoIdentifier();
    if (node) {
      if (!this.hasWhitespace() && this.accept(TokenType.ParenthesisL)) {
        var tryAsSelector = function() {
          var selectors = _this.create(Node);
          if (!selectors.addChild(_this._parseSelector(false))) {
            return null;
          }
          while (_this.accept(TokenType.Comma) && selectors.addChild(_this._parseSelector(false))) {
          }
          if (_this.peek(TokenType.ParenthesisR)) {
            return _this.finish(selectors);
          }
          return null;
        };
        node.addChild(this.try(tryAsSelector) || this._parseBinaryExpr());
        if (!this.accept(TokenType.ParenthesisR)) {
          return this.finish(node, ParseError.RightParenthesisExpected);
        }
      }
      return this.finish(node);
    }
    return null;
  };
  Parser2.prototype._tryParsePseudoIdentifier = function() {
    if (!this.peek(TokenType.Colon)) {
      return null;
    }
    var pos = this.mark();
    var node = this.createNode(NodeType.PseudoSelector);
    this.consumeToken();
    if (this.hasWhitespace()) {
      this.restoreAtMark(pos);
      return null;
    }
    this.accept(TokenType.Colon);
    if (this.hasWhitespace() || !node.addChild(this._parseIdent())) {
      return this.finish(node, ParseError.IdentifierExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._tryParsePrio = function() {
    var mark = this.mark();
    var prio = this._parsePrio();
    if (prio) {
      return prio;
    }
    this.restoreAtMark(mark);
    return null;
  };
  Parser2.prototype._parsePrio = function() {
    if (!this.peek(TokenType.Exclamation)) {
      return null;
    }
    var node = this.createNode(NodeType.Prio);
    if (this.accept(TokenType.Exclamation) && this.acceptIdent("important")) {
      return this.finish(node);
    }
    return null;
  };
  Parser2.prototype._parseExpr = function(stopOnComma) {
    if (stopOnComma === void 0) {
      stopOnComma = false;
    }
    var node = this.create(Expression);
    if (!node.addChild(this._parseBinaryExpr())) {
      return null;
    }
    while (true) {
      if (this.peek(TokenType.Comma)) {
        if (stopOnComma) {
          return this.finish(node);
        }
        this.consumeToken();
      }
      if (!node.addChild(this._parseBinaryExpr())) {
        break;
      }
    }
    return this.finish(node);
  };
  Parser2.prototype._parseNamedLine = function() {
    if (!this.peek(TokenType.BracketL)) {
      return null;
    }
    var node = this.createNode(NodeType.GridLine);
    this.consumeToken();
    while (node.addChild(this._parseIdent())) {
    }
    if (!this.accept(TokenType.BracketR)) {
      return this.finish(node, ParseError.RightSquareBracketExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseBinaryExpr = function(preparsedLeft, preparsedOper) {
    var node = this.create(BinaryExpression);
    if (!node.setLeft(preparsedLeft || this._parseTerm())) {
      return null;
    }
    if (!node.setOperator(preparsedOper || this._parseOperator())) {
      return this.finish(node);
    }
    if (!node.setRight(this._parseTerm())) {
      return this.finish(node, ParseError.TermExpected);
    }
    node = this.finish(node);
    var operator = this._parseOperator();
    if (operator) {
      node = this._parseBinaryExpr(node, operator);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseTerm = function() {
    var node = this.create(Term);
    node.setOperator(this._parseUnaryOperator());
    if (node.setExpression(this._parseTermExpression())) {
      return this.finish(node);
    }
    return null;
  };
  Parser2.prototype._parseTermExpression = function() {
    return this._parseURILiteral() || this._parseFunction() || this._parseIdent() || this._parseStringLiteral() || this._parseNumeric() || this._parseHexColor() || this._parseOperation() || this._parseNamedLine();
  };
  Parser2.prototype._parseOperation = function() {
    if (!this.peek(TokenType.ParenthesisL)) {
      return null;
    }
    var node = this.create(Node);
    this.consumeToken();
    node.addChild(this._parseExpr());
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseNumeric = function() {
    if (this.peek(TokenType.Num) || this.peek(TokenType.Percentage) || this.peek(TokenType.Resolution) || this.peek(TokenType.Length) || this.peek(TokenType.EMS) || this.peek(TokenType.EXS) || this.peek(TokenType.Angle) || this.peek(TokenType.Time) || this.peek(TokenType.Dimension) || this.peek(TokenType.Freq)) {
      var node = this.create(NumericValue);
      this.consumeToken();
      return this.finish(node);
    }
    return null;
  };
  Parser2.prototype._parseStringLiteral = function() {
    if (!this.peek(TokenType.String) && !this.peek(TokenType.BadString)) {
      return null;
    }
    var node = this.createNode(NodeType.StringLiteral);
    this.consumeToken();
    return this.finish(node);
  };
  Parser2.prototype._parseURILiteral = function() {
    if (!this.peekRegExp(TokenType.Ident, /^url(-prefix)?$/i)) {
      return null;
    }
    var pos = this.mark();
    var node = this.createNode(NodeType.URILiteral);
    this.accept(TokenType.Ident);
    if (this.hasWhitespace() || !this.peek(TokenType.ParenthesisL)) {
      this.restoreAtMark(pos);
      return null;
    }
    this.scanner.inURL = true;
    this.consumeToken();
    node.addChild(this._parseURLArgument());
    this.scanner.inURL = false;
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseURLArgument = function() {
    var node = this.create(Node);
    if (!this.accept(TokenType.String) && !this.accept(TokenType.BadString) && !this.acceptUnquotedString()) {
      return null;
    }
    return this.finish(node);
  };
  Parser2.prototype._parseIdent = function(referenceTypes) {
    if (!this.peek(TokenType.Ident)) {
      return null;
    }
    var node = this.create(Identifier);
    if (referenceTypes) {
      node.referenceTypes = referenceTypes;
    }
    node.isCustomProperty = this.peekRegExp(TokenType.Ident, /^--/);
    this.consumeToken();
    return this.finish(node);
  };
  Parser2.prototype._parseFunction = function() {
    var pos = this.mark();
    var node = this.create(Function);
    if (!node.setIdentifier(this._parseFunctionIdentifier())) {
      return null;
    }
    if (this.hasWhitespace() || !this.accept(TokenType.ParenthesisL)) {
      this.restoreAtMark(pos);
      return null;
    }
    if (node.getArguments().addChild(this._parseFunctionArgument())) {
      while (this.accept(TokenType.Comma)) {
        if (this.peek(TokenType.ParenthesisR)) {
          break;
        }
        if (!node.getArguments().addChild(this._parseFunctionArgument())) {
          this.markError(node, ParseError.ExpressionExpected);
        }
      }
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  Parser2.prototype._parseFunctionIdentifier = function() {
    if (!this.peek(TokenType.Ident)) {
      return null;
    }
    var node = this.create(Identifier);
    node.referenceTypes = [ReferenceType.Function];
    if (this.acceptIdent("progid")) {
      if (this.accept(TokenType.Colon)) {
        while (this.accept(TokenType.Ident) && this.acceptDelim(".")) {
        }
      }
      return this.finish(node);
    }
    this.consumeToken();
    return this.finish(node);
  };
  Parser2.prototype._parseFunctionArgument = function() {
    var node = this.create(FunctionArgument);
    if (node.setValue(this._parseExpr(true))) {
      return this.finish(node);
    }
    return null;
  };
  Parser2.prototype._parseHexColor = function() {
    if (this.peekRegExp(TokenType.Hash, /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/g)) {
      var node = this.create(HexColorValue);
      this.consumeToken();
      return this.finish(node);
    } else {
      return null;
    }
  };
  return Parser2;
}();
function findFirst(array, p) {
  var low = 0, high = array.length;
  if (high === 0) {
    return 0;
  }
  while (low < high) {
    var mid = Math.floor((low + high) / 2);
    if (p(array[mid])) {
      high = mid;
    } else {
      low = mid + 1;
    }
  }
  return low;
}
var __extends$8 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var Scope = function() {
  function Scope2(offset, length) {
    this.offset = offset;
    this.length = length;
    this.symbols = [];
    this.parent = null;
    this.children = [];
  }
  Scope2.prototype.addChild = function(scope) {
    this.children.push(scope);
    scope.setParent(this);
  };
  Scope2.prototype.setParent = function(scope) {
    this.parent = scope;
  };
  Scope2.prototype.findScope = function(offset, length) {
    if (length === void 0) {
      length = 0;
    }
    if (this.offset <= offset && this.offset + this.length > offset + length || this.offset === offset && this.length === length) {
      return this.findInScope(offset, length);
    }
    return null;
  };
  Scope2.prototype.findInScope = function(offset, length) {
    if (length === void 0) {
      length = 0;
    }
    var end = offset + length;
    var idx = findFirst(this.children, function(s) {
      return s.offset > end;
    });
    if (idx === 0) {
      return this;
    }
    var res = this.children[idx - 1];
    if (res.offset <= offset && res.offset + res.length >= offset + length) {
      return res.findInScope(offset, length);
    }
    return this;
  };
  Scope2.prototype.addSymbol = function(symbol) {
    this.symbols.push(symbol);
  };
  Scope2.prototype.getSymbol = function(name, type) {
    for (var index = 0; index < this.symbols.length; index++) {
      var symbol = this.symbols[index];
      if (symbol.name === name && symbol.type === type) {
        return symbol;
      }
    }
    return null;
  };
  Scope2.prototype.getSymbols = function() {
    return this.symbols;
  };
  return Scope2;
}();
var GlobalScope = function(_super) {
  __extends$8(GlobalScope2, _super);
  function GlobalScope2() {
    return _super.call(this, 0, Number.MAX_VALUE) || this;
  }
  return GlobalScope2;
}(Scope);
var Symbol$1 = function() {
  function Symbol2(name, value, node, type) {
    this.name = name;
    this.value = value;
    this.node = node;
    this.type = type;
  }
  return Symbol2;
}();
var ScopeBuilder = function() {
  function ScopeBuilder2(scope) {
    this.scope = scope;
  }
  ScopeBuilder2.prototype.addSymbol = function(node, name, value, type) {
    if (node.offset !== -1) {
      var current = this.scope.findScope(node.offset, node.length);
      if (current) {
        current.addSymbol(new Symbol$1(name, value, node, type));
      }
    }
  };
  ScopeBuilder2.prototype.addScope = function(node) {
    if (node.offset !== -1) {
      var current = this.scope.findScope(node.offset, node.length);
      if (current && (current.offset !== node.offset || current.length !== node.length)) {
        var newScope = new Scope(node.offset, node.length);
        current.addChild(newScope);
        return newScope;
      }
      return current;
    }
    return null;
  };
  ScopeBuilder2.prototype.addSymbolToChildScope = function(scopeNode, node, name, value, type) {
    if (scopeNode && scopeNode.offset !== -1) {
      var current = this.addScope(scopeNode);
      if (current) {
        current.addSymbol(new Symbol$1(name, value, node, type));
      }
    }
  };
  ScopeBuilder2.prototype.visitNode = function(node) {
    switch (node.type) {
      case NodeType.Keyframe:
        this.addSymbol(node, node.getName(), void 0, ReferenceType.Keyframe);
        return true;
      case NodeType.CustomPropertyDeclaration:
        return this.visitCustomPropertyDeclarationNode(node);
      case NodeType.VariableDeclaration:
        return this.visitVariableDeclarationNode(node);
      case NodeType.Ruleset:
        return this.visitRuleSet(node);
      case NodeType.MixinDeclaration:
        this.addSymbol(node, node.getName(), void 0, ReferenceType.Mixin);
        return true;
      case NodeType.FunctionDeclaration:
        this.addSymbol(node, node.getName(), void 0, ReferenceType.Function);
        return true;
      case NodeType.FunctionParameter: {
        return this.visitFunctionParameterNode(node);
      }
      case NodeType.Declarations:
        this.addScope(node);
        return true;
      case NodeType.For:
        var forNode = node;
        var scopeNode = forNode.getDeclarations();
        if (scopeNode && forNode.variable) {
          this.addSymbolToChildScope(scopeNode, forNode.variable, forNode.variable.getName(), void 0, ReferenceType.Variable);
        }
        return true;
      case NodeType.Each: {
        var eachNode = node;
        var scopeNode_1 = eachNode.getDeclarations();
        if (scopeNode_1) {
          var variables = eachNode.getVariables().getChildren();
          for (var _i = 0, variables_1 = variables; _i < variables_1.length; _i++) {
            var variable = variables_1[_i];
            this.addSymbolToChildScope(scopeNode_1, variable, variable.getName(), void 0, ReferenceType.Variable);
          }
        }
        return true;
      }
    }
    return true;
  };
  ScopeBuilder2.prototype.visitRuleSet = function(node) {
    var current = this.scope.findScope(node.offset, node.length);
    if (current) {
      for (var _i = 0, _a2 = node.getSelectors().getChildren(); _i < _a2.length; _i++) {
        var child = _a2[_i];
        if (child instanceof Selector) {
          if (child.getChildren().length === 1) {
            current.addSymbol(new Symbol$1(child.getChild(0).getText(), void 0, child, ReferenceType.Rule));
          }
        }
      }
    }
    return true;
  };
  ScopeBuilder2.prototype.visitVariableDeclarationNode = function(node) {
    var value = node.getValue() ? node.getValue().getText() : void 0;
    this.addSymbol(node, node.getName(), value, ReferenceType.Variable);
    return true;
  };
  ScopeBuilder2.prototype.visitFunctionParameterNode = function(node) {
    var scopeNode = node.getParent().getDeclarations();
    if (scopeNode) {
      var valueNode = node.getDefaultValue();
      var value = valueNode ? valueNode.getText() : void 0;
      this.addSymbolToChildScope(scopeNode, node, node.getName(), value, ReferenceType.Variable);
    }
    return true;
  };
  ScopeBuilder2.prototype.visitCustomPropertyDeclarationNode = function(node) {
    var value = node.getValue() ? node.getValue().getText() : "";
    this.addCSSVariable(node.getProperty(), node.getProperty().getName(), value, ReferenceType.Variable);
    return true;
  };
  ScopeBuilder2.prototype.addCSSVariable = function(node, name, value, type) {
    if (node.offset !== -1) {
      this.scope.addSymbol(new Symbol$1(name, value, node, type));
    }
  };
  return ScopeBuilder2;
}();
var Symbols = function() {
  function Symbols2(node) {
    this.global = new GlobalScope();
    node.acceptVisitor(new ScopeBuilder(this.global));
  }
  Symbols2.prototype.findSymbolsAtOffset = function(offset, referenceType) {
    var scope = this.global.findScope(offset, 0);
    var result = [];
    var names = {};
    while (scope) {
      var symbols = scope.getSymbols();
      for (var i = 0; i < symbols.length; i++) {
        var symbol = symbols[i];
        if (symbol.type === referenceType && !names[symbol.name]) {
          result.push(symbol);
          names[symbol.name] = true;
        }
      }
      scope = scope.parent;
    }
    return result;
  };
  Symbols2.prototype.internalFindSymbol = function(node, referenceTypes) {
    var scopeNode = node;
    if (node.parent instanceof FunctionParameter && node.parent.getParent() instanceof BodyDeclaration) {
      scopeNode = node.parent.getParent().getDeclarations();
    }
    if (node.parent instanceof FunctionArgument && node.parent.getParent() instanceof Function) {
      var funcId = node.parent.getParent().getIdentifier();
      if (funcId) {
        var functionSymbol = this.internalFindSymbol(funcId, [ReferenceType.Function]);
        if (functionSymbol) {
          scopeNode = functionSymbol.node.getDeclarations();
        }
      }
    }
    if (!scopeNode) {
      return null;
    }
    var name = node.getText();
    var scope = this.global.findScope(scopeNode.offset, scopeNode.length);
    while (scope) {
      for (var index = 0; index < referenceTypes.length; index++) {
        var type = referenceTypes[index];
        var symbol = scope.getSymbol(name, type);
        if (symbol) {
          return symbol;
        }
      }
      scope = scope.parent;
    }
    return null;
  };
  Symbols2.prototype.evaluateReferenceTypes = function(node) {
    if (node instanceof Identifier) {
      var referenceTypes = node.referenceTypes;
      if (referenceTypes) {
        return referenceTypes;
      } else {
        if (node.isCustomProperty) {
          return [ReferenceType.Variable];
        }
        var decl = getParentDeclaration(node);
        if (decl) {
          var propertyName = decl.getNonPrefixedPropertyName();
          if ((propertyName === "animation" || propertyName === "animation-name") && decl.getValue() && decl.getValue().offset === node.offset) {
            return [ReferenceType.Keyframe];
          }
        }
      }
    } else if (node instanceof Variable) {
      return [ReferenceType.Variable];
    }
    var selector = node.findAParent(NodeType.Selector, NodeType.ExtendsReference);
    if (selector) {
      return [ReferenceType.Rule];
    }
    return null;
  };
  Symbols2.prototype.findSymbolFromNode = function(node) {
    if (!node) {
      return null;
    }
    while (node.type === NodeType.Interpolation) {
      node = node.getParent();
    }
    var referenceTypes = this.evaluateReferenceTypes(node);
    if (referenceTypes) {
      return this.internalFindSymbol(node, referenceTypes);
    }
    return null;
  };
  Symbols2.prototype.matchesSymbol = function(node, symbol) {
    if (!node) {
      return false;
    }
    while (node.type === NodeType.Interpolation) {
      node = node.getParent();
    }
    if (!node.matches(symbol.name)) {
      return false;
    }
    var referenceTypes = this.evaluateReferenceTypes(node);
    if (!referenceTypes || referenceTypes.indexOf(symbol.type) === -1) {
      return false;
    }
    var nodeSymbol = this.internalFindSymbol(node, referenceTypes);
    return nodeSymbol === symbol;
  };
  Symbols2.prototype.findSymbol = function(name, type, offset) {
    var scope = this.global.findScope(offset);
    while (scope) {
      var symbol = scope.getSymbol(name, type);
      if (symbol) {
        return symbol;
      }
      scope = scope.parent;
    }
    return null;
  };
  return Symbols2;
}();
var integer;
(function(integer2) {
  integer2.MIN_VALUE = -2147483648;
  integer2.MAX_VALUE = 2147483647;
})(integer || (integer = {}));
var uinteger;
(function(uinteger2) {
  uinteger2.MIN_VALUE = 0;
  uinteger2.MAX_VALUE = 2147483647;
})(uinteger || (uinteger = {}));
var Position;
(function(Position2) {
  function create(line, character) {
    if (line === Number.MAX_VALUE) {
      line = uinteger.MAX_VALUE;
    }
    if (character === Number.MAX_VALUE) {
      character = uinteger.MAX_VALUE;
    }
    return { line, character };
  }
  Position2.create = create;
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
  }
  Position2.is = is;
})(Position || (Position = {}));
var Range;
(function(Range2) {
  function create(one, two, three, four) {
    if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
      return { start: Position.create(one, two), end: Position.create(three, four) };
    } else if (Position.is(one) && Position.is(two)) {
      return { start: one, end: two };
    } else {
      throw new Error("Range#create called with invalid arguments[" + one + ", " + two + ", " + three + ", " + four + "]");
    }
  }
  Range2.create = create;
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(candidate) && Position.is(candidate.start) && Position.is(candidate.end);
  }
  Range2.is = is;
})(Range || (Range = {}));
var Location;
(function(Location2) {
  function create(uri, range) {
    return { uri, range };
  }
  Location2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
  }
  Location2.is = is;
})(Location || (Location = {}));
var LocationLink;
(function(LocationLink2) {
  function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
    return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
  }
  LocationLink2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.targetRange) && Is.string(candidate.targetUri) && (Range.is(candidate.targetSelectionRange) || Is.undefined(candidate.targetSelectionRange)) && (Range.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
  }
  LocationLink2.is = is;
})(LocationLink || (LocationLink = {}));
var Color;
(function(Color2) {
  function create(red, green, blue, alpha) {
    return {
      red,
      green,
      blue,
      alpha
    };
  }
  Color2.create = create;
  function is(value) {
    var candidate = value;
    return Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
  }
  Color2.is = is;
})(Color || (Color = {}));
var ColorInformation;
(function(ColorInformation2) {
  function create(range, color) {
    return {
      range,
      color
    };
  }
  ColorInformation2.create = create;
  function is(value) {
    var candidate = value;
    return Range.is(candidate.range) && Color.is(candidate.color);
  }
  ColorInformation2.is = is;
})(ColorInformation || (ColorInformation = {}));
var ColorPresentation;
(function(ColorPresentation2) {
  function create(label, textEdit, additionalTextEdits) {
    return {
      label,
      textEdit,
      additionalTextEdits
    };
  }
  ColorPresentation2.create = create;
  function is(value) {
    var candidate = value;
    return Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
  }
  ColorPresentation2.is = is;
})(ColorPresentation || (ColorPresentation = {}));
var FoldingRangeKind;
(function(FoldingRangeKind2) {
  FoldingRangeKind2["Comment"] = "comment";
  FoldingRangeKind2["Imports"] = "imports";
  FoldingRangeKind2["Region"] = "region";
})(FoldingRangeKind || (FoldingRangeKind = {}));
var FoldingRange;
(function(FoldingRange2) {
  function create(startLine, endLine, startCharacter, endCharacter, kind) {
    var result = {
      startLine,
      endLine
    };
    if (Is.defined(startCharacter)) {
      result.startCharacter = startCharacter;
    }
    if (Is.defined(endCharacter)) {
      result.endCharacter = endCharacter;
    }
    if (Is.defined(kind)) {
      result.kind = kind;
    }
    return result;
  }
  FoldingRange2.create = create;
  function is(value) {
    var candidate = value;
    return Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
  }
  FoldingRange2.is = is;
})(FoldingRange || (FoldingRange = {}));
var DiagnosticRelatedInformation;
(function(DiagnosticRelatedInformation2) {
  function create(location, message) {
    return {
      location,
      message
    };
  }
  DiagnosticRelatedInformation2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
  }
  DiagnosticRelatedInformation2.is = is;
})(DiagnosticRelatedInformation || (DiagnosticRelatedInformation = {}));
var DiagnosticSeverity;
(function(DiagnosticSeverity2) {
  DiagnosticSeverity2.Error = 1;
  DiagnosticSeverity2.Warning = 2;
  DiagnosticSeverity2.Information = 3;
  DiagnosticSeverity2.Hint = 4;
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
var DiagnosticTag;
(function(DiagnosticTag2) {
  DiagnosticTag2.Unnecessary = 1;
  DiagnosticTag2.Deprecated = 2;
})(DiagnosticTag || (DiagnosticTag = {}));
var CodeDescription;
(function(CodeDescription2) {
  function is(value) {
    var candidate = value;
    return candidate !== void 0 && candidate !== null && Is.string(candidate.href);
  }
  CodeDescription2.is = is;
})(CodeDescription || (CodeDescription = {}));
var Diagnostic;
(function(Diagnostic2) {
  function create(range, message, severity, code, source, relatedInformation) {
    var result = { range, message };
    if (Is.defined(severity)) {
      result.severity = severity;
    }
    if (Is.defined(code)) {
      result.code = code;
    }
    if (Is.defined(source)) {
      result.source = source;
    }
    if (Is.defined(relatedInformation)) {
      result.relatedInformation = relatedInformation;
    }
    return result;
  }
  Diagnostic2.create = create;
  function is(value) {
    var _a2;
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a2 = candidate.codeDescription) === null || _a2 === void 0 ? void 0 : _a2.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
  }
  Diagnostic2.is = is;
})(Diagnostic || (Diagnostic = {}));
var Command;
(function(Command2) {
  function create(title, command) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      args[_i - 2] = arguments[_i];
    }
    var result = { title, command };
    if (Is.defined(args) && args.length > 0) {
      result.arguments = args;
    }
    return result;
  }
  Command2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
  }
  Command2.is = is;
})(Command || (Command = {}));
var TextEdit;
(function(TextEdit2) {
  function replace(range, newText) {
    return { range, newText };
  }
  TextEdit2.replace = replace;
  function insert(position, newText) {
    return { range: { start: position, end: position }, newText };
  }
  TextEdit2.insert = insert;
  function del(range) {
    return { range, newText: "" };
  }
  TextEdit2.del = del;
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range.is(candidate.range);
  }
  TextEdit2.is = is;
})(TextEdit || (TextEdit = {}));
var ChangeAnnotation;
(function(ChangeAnnotation2) {
  function create(label, needsConfirmation, description) {
    var result = { label };
    if (needsConfirmation !== void 0) {
      result.needsConfirmation = needsConfirmation;
    }
    if (description !== void 0) {
      result.description = description;
    }
    return result;
  }
  ChangeAnnotation2.create = create;
  function is(value) {
    var candidate = value;
    return candidate !== void 0 && Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
  }
  ChangeAnnotation2.is = is;
})(ChangeAnnotation || (ChangeAnnotation = {}));
var ChangeAnnotationIdentifier;
(function(ChangeAnnotationIdentifier2) {
  function is(value) {
    var candidate = value;
    return typeof candidate === "string";
  }
  ChangeAnnotationIdentifier2.is = is;
})(ChangeAnnotationIdentifier || (ChangeAnnotationIdentifier = {}));
var AnnotatedTextEdit;
(function(AnnotatedTextEdit2) {
  function replace(range, newText, annotation) {
    return { range, newText, annotationId: annotation };
  }
  AnnotatedTextEdit2.replace = replace;
  function insert(position, newText, annotation) {
    return { range: { start: position, end: position }, newText, annotationId: annotation };
  }
  AnnotatedTextEdit2.insert = insert;
  function del(range, annotation) {
    return { range, newText: "", annotationId: annotation };
  }
  AnnotatedTextEdit2.del = del;
  function is(value) {
    var candidate = value;
    return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  AnnotatedTextEdit2.is = is;
})(AnnotatedTextEdit || (AnnotatedTextEdit = {}));
var TextDocumentEdit;
(function(TextDocumentEdit2) {
  function create(textDocument, edits) {
    return { textDocument, edits };
  }
  TextDocumentEdit2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
  }
  TextDocumentEdit2.is = is;
})(TextDocumentEdit || (TextDocumentEdit = {}));
var CreateFile;
(function(CreateFile2) {
  function create(uri, options, annotation) {
    var result = {
      kind: "create",
      uri
    };
    if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  CreateFile2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  CreateFile2.is = is;
})(CreateFile || (CreateFile = {}));
var RenameFile;
(function(RenameFile2) {
  function create(oldUri, newUri, options, annotation) {
    var result = {
      kind: "rename",
      oldUri,
      newUri
    };
    if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  RenameFile2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  RenameFile2.is = is;
})(RenameFile || (RenameFile = {}));
var DeleteFile;
(function(DeleteFile2) {
  function create(uri, options, annotation) {
    var result = {
      kind: "delete",
      uri
    };
    if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
      result.options = options;
    }
    if (annotation !== void 0) {
      result.annotationId = annotation;
    }
    return result;
  }
  DeleteFile2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
  }
  DeleteFile2.is = is;
})(DeleteFile || (DeleteFile = {}));
var WorkspaceEdit;
(function(WorkspaceEdit2) {
  function is(value) {
    var candidate = value;
    return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
      if (Is.string(change.kind)) {
        return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
      } else {
        return TextDocumentEdit.is(change);
      }
    }));
  }
  WorkspaceEdit2.is = is;
})(WorkspaceEdit || (WorkspaceEdit = {}));
var TextEditChangeImpl = function() {
  function TextEditChangeImpl2(edits, changeAnnotations) {
    this.edits = edits;
    this.changeAnnotations = changeAnnotations;
  }
  TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
    var edit;
    var id;
    if (annotation === void 0) {
      edit = TextEdit.insert(position, newText);
    } else if (ChangeAnnotationIdentifier.is(annotation)) {
      id = annotation;
      edit = AnnotatedTextEdit.insert(position, newText, annotation);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      id = this.changeAnnotations.manage(annotation);
      edit = AnnotatedTextEdit.insert(position, newText, id);
    }
    this.edits.push(edit);
    if (id !== void 0) {
      return id;
    }
  };
  TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
    var edit;
    var id;
    if (annotation === void 0) {
      edit = TextEdit.replace(range, newText);
    } else if (ChangeAnnotationIdentifier.is(annotation)) {
      id = annotation;
      edit = AnnotatedTextEdit.replace(range, newText, annotation);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      id = this.changeAnnotations.manage(annotation);
      edit = AnnotatedTextEdit.replace(range, newText, id);
    }
    this.edits.push(edit);
    if (id !== void 0) {
      return id;
    }
  };
  TextEditChangeImpl2.prototype.delete = function(range, annotation) {
    var edit;
    var id;
    if (annotation === void 0) {
      edit = TextEdit.del(range);
    } else if (ChangeAnnotationIdentifier.is(annotation)) {
      id = annotation;
      edit = AnnotatedTextEdit.del(range, annotation);
    } else {
      this.assertChangeAnnotations(this.changeAnnotations);
      id = this.changeAnnotations.manage(annotation);
      edit = AnnotatedTextEdit.del(range, id);
    }
    this.edits.push(edit);
    if (id !== void 0) {
      return id;
    }
  };
  TextEditChangeImpl2.prototype.add = function(edit) {
    this.edits.push(edit);
  };
  TextEditChangeImpl2.prototype.all = function() {
    return this.edits;
  };
  TextEditChangeImpl2.prototype.clear = function() {
    this.edits.splice(0, this.edits.length);
  };
  TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
    if (value === void 0) {
      throw new Error("Text edit change is not configured to manage change annotations.");
    }
  };
  return TextEditChangeImpl2;
}();
var ChangeAnnotations = function() {
  function ChangeAnnotations2(annotations) {
    this._annotations = annotations === void 0 ? Object.create(null) : annotations;
    this._counter = 0;
    this._size = 0;
  }
  ChangeAnnotations2.prototype.all = function() {
    return this._annotations;
  };
  Object.defineProperty(ChangeAnnotations2.prototype, "size", {
    get: function() {
      return this._size;
    },
    enumerable: false,
    configurable: true
  });
  ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
    var id;
    if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
      id = idOrAnnotation;
    } else {
      id = this.nextId();
      annotation = idOrAnnotation;
    }
    if (this._annotations[id] !== void 0) {
      throw new Error("Id " + id + " is already in use.");
    }
    if (annotation === void 0) {
      throw new Error("No annotation provided for id " + id);
    }
    this._annotations[id] = annotation;
    this._size++;
    return id;
  };
  ChangeAnnotations2.prototype.nextId = function() {
    this._counter++;
    return this._counter.toString();
  };
  return ChangeAnnotations2;
}();
(function() {
  function WorkspaceChange(workspaceEdit) {
    var _this = this;
    this._textEditChanges = Object.create(null);
    if (workspaceEdit !== void 0) {
      this._workspaceEdit = workspaceEdit;
      if (workspaceEdit.documentChanges) {
        this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
        workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        workspaceEdit.documentChanges.forEach(function(change) {
          if (TextDocumentEdit.is(change)) {
            var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
            _this._textEditChanges[change.textDocument.uri] = textEditChange;
          }
        });
      } else if (workspaceEdit.changes) {
        Object.keys(workspaceEdit.changes).forEach(function(key) {
          var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
          _this._textEditChanges[key] = textEditChange;
        });
      }
    } else {
      this._workspaceEdit = {};
    }
  }
  Object.defineProperty(WorkspaceChange.prototype, "edit", {
    get: function() {
      this.initDocumentChanges();
      if (this._changeAnnotations !== void 0) {
        if (this._changeAnnotations.size === 0) {
          this._workspaceEdit.changeAnnotations = void 0;
        } else {
          this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
        }
      }
      return this._workspaceEdit;
    },
    enumerable: false,
    configurable: true
  });
  WorkspaceChange.prototype.getTextEditChange = function(key) {
    if (OptionalVersionedTextDocumentIdentifier.is(key)) {
      this.initDocumentChanges();
      if (this._workspaceEdit.documentChanges === void 0) {
        throw new Error("Workspace edit is not configured for document changes.");
      }
      var textDocument = { uri: key.uri, version: key.version };
      var result = this._textEditChanges[textDocument.uri];
      if (!result) {
        var edits = [];
        var textDocumentEdit = {
          textDocument,
          edits
        };
        this._workspaceEdit.documentChanges.push(textDocumentEdit);
        result = new TextEditChangeImpl(edits, this._changeAnnotations);
        this._textEditChanges[textDocument.uri] = result;
      }
      return result;
    } else {
      this.initChanges();
      if (this._workspaceEdit.changes === void 0) {
        throw new Error("Workspace edit is not configured for normal text edit changes.");
      }
      var result = this._textEditChanges[key];
      if (!result) {
        var edits = [];
        this._workspaceEdit.changes[key] = edits;
        result = new TextEditChangeImpl(edits);
        this._textEditChanges[key] = result;
      }
      return result;
    }
  };
  WorkspaceChange.prototype.initDocumentChanges = function() {
    if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
      this._changeAnnotations = new ChangeAnnotations();
      this._workspaceEdit.documentChanges = [];
      this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
    }
  };
  WorkspaceChange.prototype.initChanges = function() {
    if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
      this._workspaceEdit.changes = Object.create(null);
    }
  };
  WorkspaceChange.prototype.createFile = function(uri, optionsOrAnnotation, options) {
    this.initDocumentChanges();
    if (this._workspaceEdit.documentChanges === void 0) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var annotation;
    if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
      annotation = optionsOrAnnotation;
    } else {
      options = optionsOrAnnotation;
    }
    var operation;
    var id;
    if (annotation === void 0) {
      operation = CreateFile.create(uri, options);
    } else {
      id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
      operation = CreateFile.create(uri, options, id);
    }
    this._workspaceEdit.documentChanges.push(operation);
    if (id !== void 0) {
      return id;
    }
  };
  WorkspaceChange.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
    this.initDocumentChanges();
    if (this._workspaceEdit.documentChanges === void 0) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var annotation;
    if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
      annotation = optionsOrAnnotation;
    } else {
      options = optionsOrAnnotation;
    }
    var operation;
    var id;
    if (annotation === void 0) {
      operation = RenameFile.create(oldUri, newUri, options);
    } else {
      id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
      operation = RenameFile.create(oldUri, newUri, options, id);
    }
    this._workspaceEdit.documentChanges.push(operation);
    if (id !== void 0) {
      return id;
    }
  };
  WorkspaceChange.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
    this.initDocumentChanges();
    if (this._workspaceEdit.documentChanges === void 0) {
      throw new Error("Workspace edit is not configured for document changes.");
    }
    var annotation;
    if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
      annotation = optionsOrAnnotation;
    } else {
      options = optionsOrAnnotation;
    }
    var operation;
    var id;
    if (annotation === void 0) {
      operation = DeleteFile.create(uri, options);
    } else {
      id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
      operation = DeleteFile.create(uri, options, id);
    }
    this._workspaceEdit.documentChanges.push(operation);
    if (id !== void 0) {
      return id;
    }
  };
  return WorkspaceChange;
})();
var TextDocumentIdentifier;
(function(TextDocumentIdentifier2) {
  function create(uri) {
    return { uri };
  }
  TextDocumentIdentifier2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri);
  }
  TextDocumentIdentifier2.is = is;
})(TextDocumentIdentifier || (TextDocumentIdentifier = {}));
var VersionedTextDocumentIdentifier;
(function(VersionedTextDocumentIdentifier2) {
  function create(uri, version) {
    return { uri, version };
  }
  VersionedTextDocumentIdentifier2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
  }
  VersionedTextDocumentIdentifier2.is = is;
})(VersionedTextDocumentIdentifier || (VersionedTextDocumentIdentifier = {}));
var OptionalVersionedTextDocumentIdentifier;
(function(OptionalVersionedTextDocumentIdentifier2) {
  function create(uri, version) {
    return { uri, version };
  }
  OptionalVersionedTextDocumentIdentifier2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
  }
  OptionalVersionedTextDocumentIdentifier2.is = is;
})(OptionalVersionedTextDocumentIdentifier || (OptionalVersionedTextDocumentIdentifier = {}));
var TextDocumentItem;
(function(TextDocumentItem2) {
  function create(uri, languageId, version, text) {
    return { uri, languageId, version, text };
  }
  TextDocumentItem2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
  }
  TextDocumentItem2.is = is;
})(TextDocumentItem || (TextDocumentItem = {}));
var MarkupKind;
(function(MarkupKind2) {
  MarkupKind2.PlainText = "plaintext";
  MarkupKind2.Markdown = "markdown";
})(MarkupKind || (MarkupKind = {}));
(function(MarkupKind2) {
  function is(value) {
    var candidate = value;
    return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
  }
  MarkupKind2.is = is;
})(MarkupKind || (MarkupKind = {}));
var MarkupContent;
(function(MarkupContent2) {
  function is(value) {
    var candidate = value;
    return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
  }
  MarkupContent2.is = is;
})(MarkupContent || (MarkupContent = {}));
var CompletionItemKind;
(function(CompletionItemKind2) {
  CompletionItemKind2.Text = 1;
  CompletionItemKind2.Method = 2;
  CompletionItemKind2.Function = 3;
  CompletionItemKind2.Constructor = 4;
  CompletionItemKind2.Field = 5;
  CompletionItemKind2.Variable = 6;
  CompletionItemKind2.Class = 7;
  CompletionItemKind2.Interface = 8;
  CompletionItemKind2.Module = 9;
  CompletionItemKind2.Property = 10;
  CompletionItemKind2.Unit = 11;
  CompletionItemKind2.Value = 12;
  CompletionItemKind2.Enum = 13;
  CompletionItemKind2.Keyword = 14;
  CompletionItemKind2.Snippet = 15;
  CompletionItemKind2.Color = 16;
  CompletionItemKind2.File = 17;
  CompletionItemKind2.Reference = 18;
  CompletionItemKind2.Folder = 19;
  CompletionItemKind2.EnumMember = 20;
  CompletionItemKind2.Constant = 21;
  CompletionItemKind2.Struct = 22;
  CompletionItemKind2.Event = 23;
  CompletionItemKind2.Operator = 24;
  CompletionItemKind2.TypeParameter = 25;
})(CompletionItemKind || (CompletionItemKind = {}));
var InsertTextFormat;
(function(InsertTextFormat2) {
  InsertTextFormat2.PlainText = 1;
  InsertTextFormat2.Snippet = 2;
})(InsertTextFormat || (InsertTextFormat = {}));
var CompletionItemTag;
(function(CompletionItemTag2) {
  CompletionItemTag2.Deprecated = 1;
})(CompletionItemTag || (CompletionItemTag = {}));
var InsertReplaceEdit;
(function(InsertReplaceEdit2) {
  function create(newText, insert, replace) {
    return { newText, insert, replace };
  }
  InsertReplaceEdit2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && Is.string(candidate.newText) && Range.is(candidate.insert) && Range.is(candidate.replace);
  }
  InsertReplaceEdit2.is = is;
})(InsertReplaceEdit || (InsertReplaceEdit = {}));
var InsertTextMode;
(function(InsertTextMode2) {
  InsertTextMode2.asIs = 1;
  InsertTextMode2.adjustIndentation = 2;
})(InsertTextMode || (InsertTextMode = {}));
var CompletionItem;
(function(CompletionItem2) {
  function create(label) {
    return { label };
  }
  CompletionItem2.create = create;
})(CompletionItem || (CompletionItem = {}));
var CompletionList;
(function(CompletionList2) {
  function create(items, isIncomplete) {
    return { items: items ? items : [], isIncomplete: !!isIncomplete };
  }
  CompletionList2.create = create;
})(CompletionList || (CompletionList = {}));
var MarkedString;
(function(MarkedString2) {
  function fromPlainText(plainText) {
    return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
  }
  MarkedString2.fromPlainText = fromPlainText;
  function is(value) {
    var candidate = value;
    return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
  }
  MarkedString2.is = is;
})(MarkedString || (MarkedString = {}));
var Hover;
(function(Hover2) {
  function is(value) {
    var candidate = value;
    return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range.is(value.range));
  }
  Hover2.is = is;
})(Hover || (Hover = {}));
var ParameterInformation;
(function(ParameterInformation2) {
  function create(label, documentation) {
    return documentation ? { label, documentation } : { label };
  }
  ParameterInformation2.create = create;
})(ParameterInformation || (ParameterInformation = {}));
var SignatureInformation;
(function(SignatureInformation2) {
  function create(label, documentation) {
    var parameters = [];
    for (var _i = 2; _i < arguments.length; _i++) {
      parameters[_i - 2] = arguments[_i];
    }
    var result = { label };
    if (Is.defined(documentation)) {
      result.documentation = documentation;
    }
    if (Is.defined(parameters)) {
      result.parameters = parameters;
    } else {
      result.parameters = [];
    }
    return result;
  }
  SignatureInformation2.create = create;
})(SignatureInformation || (SignatureInformation = {}));
var DocumentHighlightKind;
(function(DocumentHighlightKind2) {
  DocumentHighlightKind2.Text = 1;
  DocumentHighlightKind2.Read = 2;
  DocumentHighlightKind2.Write = 3;
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
var DocumentHighlight;
(function(DocumentHighlight2) {
  function create(range, kind) {
    var result = { range };
    if (Is.number(kind)) {
      result.kind = kind;
    }
    return result;
  }
  DocumentHighlight2.create = create;
})(DocumentHighlight || (DocumentHighlight = {}));
var SymbolKind;
(function(SymbolKind2) {
  SymbolKind2.File = 1;
  SymbolKind2.Module = 2;
  SymbolKind2.Namespace = 3;
  SymbolKind2.Package = 4;
  SymbolKind2.Class = 5;
  SymbolKind2.Method = 6;
  SymbolKind2.Property = 7;
  SymbolKind2.Field = 8;
  SymbolKind2.Constructor = 9;
  SymbolKind2.Enum = 10;
  SymbolKind2.Interface = 11;
  SymbolKind2.Function = 12;
  SymbolKind2.Variable = 13;
  SymbolKind2.Constant = 14;
  SymbolKind2.String = 15;
  SymbolKind2.Number = 16;
  SymbolKind2.Boolean = 17;
  SymbolKind2.Array = 18;
  SymbolKind2.Object = 19;
  SymbolKind2.Key = 20;
  SymbolKind2.Null = 21;
  SymbolKind2.EnumMember = 22;
  SymbolKind2.Struct = 23;
  SymbolKind2.Event = 24;
  SymbolKind2.Operator = 25;
  SymbolKind2.TypeParameter = 26;
})(SymbolKind || (SymbolKind = {}));
var SymbolTag;
(function(SymbolTag2) {
  SymbolTag2.Deprecated = 1;
})(SymbolTag || (SymbolTag = {}));
var SymbolInformation;
(function(SymbolInformation2) {
  function create(name, kind, range, uri, containerName) {
    var result = {
      name,
      kind,
      location: { uri, range }
    };
    if (containerName) {
      result.containerName = containerName;
    }
    return result;
  }
  SymbolInformation2.create = create;
})(SymbolInformation || (SymbolInformation = {}));
var DocumentSymbol;
(function(DocumentSymbol2) {
  function create(name, detail, kind, range, selectionRange, children) {
    var result = {
      name,
      detail,
      kind,
      range,
      selectionRange
    };
    if (children !== void 0) {
      result.children = children;
    }
    return result;
  }
  DocumentSymbol2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range.is(candidate.range) && Range.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
  }
  DocumentSymbol2.is = is;
})(DocumentSymbol || (DocumentSymbol = {}));
var CodeActionKind;
(function(CodeActionKind2) {
  CodeActionKind2.Empty = "";
  CodeActionKind2.QuickFix = "quickfix";
  CodeActionKind2.Refactor = "refactor";
  CodeActionKind2.RefactorExtract = "refactor.extract";
  CodeActionKind2.RefactorInline = "refactor.inline";
  CodeActionKind2.RefactorRewrite = "refactor.rewrite";
  CodeActionKind2.Source = "source";
  CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
  CodeActionKind2.SourceFixAll = "source.fixAll";
})(CodeActionKind || (CodeActionKind = {}));
var CodeActionContext;
(function(CodeActionContext2) {
  function create(diagnostics, only) {
    var result = { diagnostics };
    if (only !== void 0 && only !== null) {
      result.only = only;
    }
    return result;
  }
  CodeActionContext2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string));
  }
  CodeActionContext2.is = is;
})(CodeActionContext || (CodeActionContext = {}));
var CodeAction;
(function(CodeAction2) {
  function create(title, kindOrCommandOrEdit, kind) {
    var result = { title };
    var checkKind = true;
    if (typeof kindOrCommandOrEdit === "string") {
      checkKind = false;
      result.kind = kindOrCommandOrEdit;
    } else if (Command.is(kindOrCommandOrEdit)) {
      result.command = kindOrCommandOrEdit;
    } else {
      result.edit = kindOrCommandOrEdit;
    }
    if (checkKind && kind !== void 0) {
      result.kind = kind;
    }
    return result;
  }
  CodeAction2.create = create;
  function is(value) {
    var candidate = value;
    return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit.is(candidate.edit));
  }
  CodeAction2.is = is;
})(CodeAction || (CodeAction = {}));
var CodeLens;
(function(CodeLens2) {
  function create(range, data) {
    var result = { range };
    if (Is.defined(data)) {
      result.data = data;
    }
    return result;
  }
  CodeLens2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
  }
  CodeLens2.is = is;
})(CodeLens || (CodeLens = {}));
var FormattingOptions;
(function(FormattingOptions2) {
  function create(tabSize, insertSpaces) {
    return { tabSize, insertSpaces };
  }
  FormattingOptions2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
  }
  FormattingOptions2.is = is;
})(FormattingOptions || (FormattingOptions = {}));
var DocumentLink;
(function(DocumentLink2) {
  function create(range, target, data) {
    return { range, target, data };
  }
  DocumentLink2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
  }
  DocumentLink2.is = is;
})(DocumentLink || (DocumentLink = {}));
var SelectionRange;
(function(SelectionRange2) {
  function create(range, parent) {
    return { range, parent };
  }
  SelectionRange2.create = create;
  function is(value) {
    var candidate = value;
    return candidate !== void 0 && Range.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
  }
  SelectionRange2.is = is;
})(SelectionRange || (SelectionRange = {}));
var TextDocument$1;
(function(TextDocument2) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument$1(uri, languageId, version, content);
  }
  TextDocument2.create = create;
  function is(value) {
    var candidate = value;
    return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
  }
  TextDocument2.is = is;
  function applyEdits(document, edits) {
    var text = document.getText();
    var sortedEdits = mergeSort2(edits, function(a2, b) {
      var diff = a2.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a2.range.start.character - b.range.start.character;
      }
      return diff;
    });
    var lastModifiedOffset = text.length;
    for (var i = sortedEdits.length - 1; i >= 0; i--) {
      var e = sortedEdits[i];
      var startOffset = document.offsetAt(e.range.start);
      var endOffset = document.offsetAt(e.range.end);
      if (endOffset <= lastModifiedOffset) {
        text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
      } else {
        throw new Error("Overlapping edit");
      }
      lastModifiedOffset = startOffset;
    }
    return text;
  }
  TextDocument2.applyEdits = applyEdits;
  function mergeSort2(data, compare) {
    if (data.length <= 1) {
      return data;
    }
    var p = data.length / 2 | 0;
    var left = data.slice(0, p);
    var right = data.slice(p);
    mergeSort2(left, compare);
    mergeSort2(right, compare);
    var leftIdx = 0;
    var rightIdx = 0;
    var i = 0;
    while (leftIdx < left.length && rightIdx < right.length) {
      var ret = compare(left[leftIdx], right[rightIdx]);
      if (ret <= 0) {
        data[i++] = left[leftIdx++];
      } else {
        data[i++] = right[rightIdx++];
      }
    }
    while (leftIdx < left.length) {
      data[i++] = left[leftIdx++];
    }
    while (rightIdx < right.length) {
      data[i++] = right[rightIdx++];
    }
    return data;
  }
})(TextDocument$1 || (TextDocument$1 = {}));
var FullTextDocument$1 = function() {
  function FullTextDocument2(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  Object.defineProperty(FullTextDocument2.prototype, "uri", {
    get: function() {
      return this._uri;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(FullTextDocument2.prototype, "languageId", {
    get: function() {
      return this._languageId;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(FullTextDocument2.prototype, "version", {
    get: function() {
      return this._version;
    },
    enumerable: false,
    configurable: true
  });
  FullTextDocument2.prototype.getText = function(range) {
    if (range) {
      var start = this.offsetAt(range.start);
      var end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  };
  FullTextDocument2.prototype.update = function(event, version) {
    this._content = event.text;
    this._version = version;
    this._lineOffsets = void 0;
  };
  FullTextDocument2.prototype.getLineOffsets = function() {
    if (this._lineOffsets === void 0) {
      var lineOffsets = [];
      var text = this._content;
      var isLineStart = true;
      for (var i = 0; i < text.length; i++) {
        if (isLineStart) {
          lineOffsets.push(i);
          isLineStart = false;
        }
        var ch = text.charAt(i);
        isLineStart = ch === "\r" || ch === "\n";
        if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
          i++;
        }
      }
      if (isLineStart && text.length > 0) {
        lineOffsets.push(text.length);
      }
      this._lineOffsets = lineOffsets;
    }
    return this._lineOffsets;
  };
  FullTextDocument2.prototype.positionAt = function(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    var lineOffsets = this.getLineOffsets();
    var low = 0, high = lineOffsets.length;
    if (high === 0) {
      return Position.create(0, offset);
    }
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    var line = low - 1;
    return Position.create(line, offset - lineOffsets[line]);
  };
  FullTextDocument2.prototype.offsetAt = function(position) {
    var lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    var lineOffset = lineOffsets[position.line];
    var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  };
  Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
    get: function() {
      return this.getLineOffsets().length;
    },
    enumerable: false,
    configurable: true
  });
  return FullTextDocument2;
}();
var Is;
(function(Is2) {
  var toString = Object.prototype.toString;
  function defined(value) {
    return typeof value !== "undefined";
  }
  Is2.defined = defined;
  function undefined$1(value) {
    return typeof value === "undefined";
  }
  Is2.undefined = undefined$1;
  function boolean(value) {
    return value === true || value === false;
  }
  Is2.boolean = boolean;
  function string(value) {
    return toString.call(value) === "[object String]";
  }
  Is2.string = string;
  function number(value) {
    return toString.call(value) === "[object Number]";
  }
  Is2.number = number;
  function numberRange(value, min, max) {
    return toString.call(value) === "[object Number]" && min <= value && value <= max;
  }
  Is2.numberRange = numberRange;
  function integer2(value) {
    return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
  }
  Is2.integer = integer2;
  function uinteger2(value) {
    return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
  }
  Is2.uinteger = uinteger2;
  function func(value) {
    return toString.call(value) === "[object Function]";
  }
  Is2.func = func;
  function objectLiteral(value) {
    return value !== null && typeof value === "object";
  }
  Is2.objectLiteral = objectLiteral;
  function typedArray(value, check) {
    return Array.isArray(value) && value.every(check);
  }
  Is2.typedArray = typedArray;
})(Is || (Is = {}));
var FullTextDocument = function() {
  function FullTextDocument2(uri, languageId, version, content) {
    this._uri = uri;
    this._languageId = languageId;
    this._version = version;
    this._content = content;
    this._lineOffsets = void 0;
  }
  Object.defineProperty(FullTextDocument2.prototype, "uri", {
    get: function() {
      return this._uri;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(FullTextDocument2.prototype, "languageId", {
    get: function() {
      return this._languageId;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(FullTextDocument2.prototype, "version", {
    get: function() {
      return this._version;
    },
    enumerable: true,
    configurable: true
  });
  FullTextDocument2.prototype.getText = function(range) {
    if (range) {
      var start = this.offsetAt(range.start);
      var end = this.offsetAt(range.end);
      return this._content.substring(start, end);
    }
    return this._content;
  };
  FullTextDocument2.prototype.update = function(changes, version) {
    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
      var change = changes_1[_i];
      if (FullTextDocument2.isIncremental(change)) {
        var range = getWellformedRange(change.range);
        var startOffset = this.offsetAt(range.start);
        var endOffset = this.offsetAt(range.end);
        this._content = this._content.substring(0, startOffset) + change.text + this._content.substring(endOffset, this._content.length);
        var startLine = Math.max(range.start.line, 0);
        var endLine = Math.max(range.end.line, 0);
        var lineOffsets = this._lineOffsets;
        var addedLineOffsets = computeLineOffsets(change.text, false, startOffset);
        if (endLine - startLine === addedLineOffsets.length) {
          for (var i = 0, len = addedLineOffsets.length; i < len; i++) {
            lineOffsets[i + startLine + 1] = addedLineOffsets[i];
          }
        } else {
          if (addedLineOffsets.length < 1e4) {
            lineOffsets.splice.apply(lineOffsets, [startLine + 1, endLine - startLine].concat(addedLineOffsets));
          } else {
            this._lineOffsets = lineOffsets = lineOffsets.slice(0, startLine + 1).concat(addedLineOffsets, lineOffsets.slice(endLine + 1));
          }
        }
        var diff = change.text.length - (endOffset - startOffset);
        if (diff !== 0) {
          for (var i = startLine + 1 + addedLineOffsets.length, len = lineOffsets.length; i < len; i++) {
            lineOffsets[i] = lineOffsets[i] + diff;
          }
        }
      } else if (FullTextDocument2.isFull(change)) {
        this._content = change.text;
        this._lineOffsets = void 0;
      } else {
        throw new Error("Unknown change event received");
      }
    }
    this._version = version;
  };
  FullTextDocument2.prototype.getLineOffsets = function() {
    if (this._lineOffsets === void 0) {
      this._lineOffsets = computeLineOffsets(this._content, true);
    }
    return this._lineOffsets;
  };
  FullTextDocument2.prototype.positionAt = function(offset) {
    offset = Math.max(Math.min(offset, this._content.length), 0);
    var lineOffsets = this.getLineOffsets();
    var low = 0, high = lineOffsets.length;
    if (high === 0) {
      return { line: 0, character: offset };
    }
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (lineOffsets[mid] > offset) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    var line = low - 1;
    return { line, character: offset - lineOffsets[line] };
  };
  FullTextDocument2.prototype.offsetAt = function(position) {
    var lineOffsets = this.getLineOffsets();
    if (position.line >= lineOffsets.length) {
      return this._content.length;
    } else if (position.line < 0) {
      return 0;
    }
    var lineOffset = lineOffsets[position.line];
    var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
    return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
  };
  Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
    get: function() {
      return this.getLineOffsets().length;
    },
    enumerable: true,
    configurable: true
  });
  FullTextDocument2.isIncremental = function(event) {
    var candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
  };
  FullTextDocument2.isFull = function(event) {
    var candidate = event;
    return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
  };
  return FullTextDocument2;
}();
var TextDocument;
(function(TextDocument2) {
  function create(uri, languageId, version, content) {
    return new FullTextDocument(uri, languageId, version, content);
  }
  TextDocument2.create = create;
  function update(document, changes, version) {
    if (document instanceof FullTextDocument) {
      document.update(changes, version);
      return document;
    } else {
      throw new Error("TextDocument.update: document must be created by TextDocument.create");
    }
  }
  TextDocument2.update = update;
  function applyEdits(document, edits) {
    var text = document.getText();
    var sortedEdits = mergeSort(edits.map(getWellformedEdit), function(a2, b) {
      var diff = a2.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a2.range.start.character - b.range.start.character;
      }
      return diff;
    });
    var lastModifiedOffset = 0;
    var spans = [];
    for (var _i = 0, sortedEdits_1 = sortedEdits; _i < sortedEdits_1.length; _i++) {
      var e = sortedEdits_1[_i];
      var startOffset = document.offsetAt(e.range.start);
      if (startOffset < lastModifiedOffset) {
        throw new Error("Overlapping edit");
      } else if (startOffset > lastModifiedOffset) {
        spans.push(text.substring(lastModifiedOffset, startOffset));
      }
      if (e.newText.length) {
        spans.push(e.newText);
      }
      lastModifiedOffset = document.offsetAt(e.range.end);
    }
    spans.push(text.substr(lastModifiedOffset));
    return spans.join("");
  }
  TextDocument2.applyEdits = applyEdits;
})(TextDocument || (TextDocument = {}));
function mergeSort(data, compare) {
  if (data.length <= 1) {
    return data;
  }
  var p = data.length / 2 | 0;
  var left = data.slice(0, p);
  var right = data.slice(p);
  mergeSort(left, compare);
  mergeSort(right, compare);
  var leftIdx = 0;
  var rightIdx = 0;
  var i = 0;
  while (leftIdx < left.length && rightIdx < right.length) {
    var ret = compare(left[leftIdx], right[rightIdx]);
    if (ret <= 0) {
      data[i++] = left[leftIdx++];
    } else {
      data[i++] = right[rightIdx++];
    }
  }
  while (leftIdx < left.length) {
    data[i++] = left[leftIdx++];
  }
  while (rightIdx < right.length) {
    data[i++] = right[rightIdx++];
  }
  return data;
}
function computeLineOffsets(text, isAtLineStart, textOffset) {
  if (textOffset === void 0) {
    textOffset = 0;
  }
  var result = isAtLineStart ? [textOffset] : [];
  for (var i = 0; i < text.length; i++) {
    var ch = text.charCodeAt(i);
    if (ch === 13 || ch === 10) {
      if (ch === 13 && i + 1 < text.length && text.charCodeAt(i + 1) === 10) {
        i++;
      }
      result.push(textOffset + i + 1);
    }
  }
  return result;
}
function getWellformedRange(range) {
  var start = range.start;
  var end = range.end;
  if (start.line > end.line || start.line === end.line && start.character > end.character) {
    return { start: end, end: start };
  }
  return range;
}
function getWellformedEdit(textEdit) {
  var range = getWellformedRange(textEdit.range);
  if (range !== textEdit.range) {
    return { newText: textEdit.newText, range };
  }
  return textEdit;
}
var ClientCapabilities;
(function(ClientCapabilities2) {
  ClientCapabilities2.LATEST = {
    textDocument: {
      completion: {
        completionItem: {
          documentationFormat: [MarkupKind.Markdown, MarkupKind.PlainText]
        }
      },
      hover: {
        contentFormat: [MarkupKind.Markdown, MarkupKind.PlainText]
      }
    }
  };
})(ClientCapabilities || (ClientCapabilities = {}));
var FileType;
(function(FileType2) {
  FileType2[FileType2["Unknown"] = 0] = "Unknown";
  FileType2[FileType2["File"] = 1] = "File";
  FileType2[FileType2["Directory"] = 2] = "Directory";
  FileType2[FileType2["SymbolicLink"] = 64] = "SymbolicLink";
})(FileType || (FileType = {}));
var LIB;
LIB = (() => {
  var t = { 470: (t2) => {
    function e2(t3) {
      if (typeof t3 != "string")
        throw new TypeError("Path must be a string. Received " + JSON.stringify(t3));
    }
    function r2(t3, e3) {
      for (var r3, n2 = "", o = 0, i = -1, a2 = 0, h = 0; h <= t3.length; ++h) {
        if (h < t3.length)
          r3 = t3.charCodeAt(h);
        else {
          if (r3 === 47)
            break;
          r3 = 47;
        }
        if (r3 === 47) {
          if (i === h - 1 || a2 === 1)
            ;
          else if (i !== h - 1 && a2 === 2) {
            if (n2.length < 2 || o !== 2 || n2.charCodeAt(n2.length - 1) !== 46 || n2.charCodeAt(n2.length - 2) !== 46) {
              if (n2.length > 2) {
                var s = n2.lastIndexOf("/");
                if (s !== n2.length - 1) {
                  s === -1 ? (n2 = "", o = 0) : o = (n2 = n2.slice(0, s)).length - 1 - n2.lastIndexOf("/"), i = h, a2 = 0;
                  continue;
                }
              } else if (n2.length === 2 || n2.length === 1) {
                n2 = "", o = 0, i = h, a2 = 0;
                continue;
              }
            }
            e3 && (n2.length > 0 ? n2 += "/.." : n2 = "..", o = 2);
          } else
            n2.length > 0 ? n2 += "/" + t3.slice(i + 1, h) : n2 = t3.slice(i + 1, h), o = h - i - 1;
          i = h, a2 = 0;
        } else
          r3 === 46 && a2 !== -1 ? ++a2 : a2 = -1;
      }
      return n2;
    }
    var n = { resolve: function() {
      for (var t3, n2 = "", o = false, i = arguments.length - 1; i >= -1 && !o; i--) {
        var a2;
        i >= 0 ? a2 = arguments[i] : (t3 === void 0 && (t3 = process.cwd()), a2 = t3), e2(a2), a2.length !== 0 && (n2 = a2 + "/" + n2, o = a2.charCodeAt(0) === 47);
      }
      return n2 = r2(n2, !o), o ? n2.length > 0 ? "/" + n2 : "/" : n2.length > 0 ? n2 : ".";
    }, normalize: function(t3) {
      if (e2(t3), t3.length === 0)
        return ".";
      var n2 = t3.charCodeAt(0) === 47, o = t3.charCodeAt(t3.length - 1) === 47;
      return (t3 = r2(t3, !n2)).length !== 0 || n2 || (t3 = "."), t3.length > 0 && o && (t3 += "/"), n2 ? "/" + t3 : t3;
    }, isAbsolute: function(t3) {
      return e2(t3), t3.length > 0 && t3.charCodeAt(0) === 47;
    }, join: function() {
      if (arguments.length === 0)
        return ".";
      for (var t3, r3 = 0; r3 < arguments.length; ++r3) {
        var o = arguments[r3];
        e2(o), o.length > 0 && (t3 === void 0 ? t3 = o : t3 += "/" + o);
      }
      return t3 === void 0 ? "." : n.normalize(t3);
    }, relative: function(t3, r3) {
      if (e2(t3), e2(r3), t3 === r3)
        return "";
      if ((t3 = n.resolve(t3)) === (r3 = n.resolve(r3)))
        return "";
      for (var o = 1; o < t3.length && t3.charCodeAt(o) === 47; ++o)
        ;
      for (var i = t3.length, a2 = i - o, h = 1; h < r3.length && r3.charCodeAt(h) === 47; ++h)
        ;
      for (var s = r3.length - h, f2 = a2 < s ? a2 : s, u = -1, c = 0; c <= f2; ++c) {
        if (c === f2) {
          if (s > f2) {
            if (r3.charCodeAt(h + c) === 47)
              return r3.slice(h + c + 1);
            if (c === 0)
              return r3.slice(h + c);
          } else
            a2 > f2 && (t3.charCodeAt(o + c) === 47 ? u = c : c === 0 && (u = 0));
          break;
        }
        var l = t3.charCodeAt(o + c);
        if (l !== r3.charCodeAt(h + c))
          break;
        l === 47 && (u = c);
      }
      var p = "";
      for (c = o + u + 1; c <= i; ++c)
        c !== i && t3.charCodeAt(c) !== 47 || (p.length === 0 ? p += ".." : p += "/..");
      return p.length > 0 ? p + r3.slice(h + u) : (h += u, r3.charCodeAt(h) === 47 && ++h, r3.slice(h));
    }, _makeLong: function(t3) {
      return t3;
    }, dirname: function(t3) {
      if (e2(t3), t3.length === 0)
        return ".";
      for (var r3 = t3.charCodeAt(0), n2 = r3 === 47, o = -1, i = true, a2 = t3.length - 1; a2 >= 1; --a2)
        if ((r3 = t3.charCodeAt(a2)) === 47) {
          if (!i) {
            o = a2;
            break;
          }
        } else
          i = false;
      return o === -1 ? n2 ? "/" : "." : n2 && o === 1 ? "//" : t3.slice(0, o);
    }, basename: function(t3, r3) {
      if (r3 !== void 0 && typeof r3 != "string")
        throw new TypeError('"ext" argument must be a string');
      e2(t3);
      var n2, o = 0, i = -1, a2 = true;
      if (r3 !== void 0 && r3.length > 0 && r3.length <= t3.length) {
        if (r3.length === t3.length && r3 === t3)
          return "";
        var h = r3.length - 1, s = -1;
        for (n2 = t3.length - 1; n2 >= 0; --n2) {
          var f2 = t3.charCodeAt(n2);
          if (f2 === 47) {
            if (!a2) {
              o = n2 + 1;
              break;
            }
          } else
            s === -1 && (a2 = false, s = n2 + 1), h >= 0 && (f2 === r3.charCodeAt(h) ? --h == -1 && (i = n2) : (h = -1, i = s));
        }
        return o === i ? i = s : i === -1 && (i = t3.length), t3.slice(o, i);
      }
      for (n2 = t3.length - 1; n2 >= 0; --n2)
        if (t3.charCodeAt(n2) === 47) {
          if (!a2) {
            o = n2 + 1;
            break;
          }
        } else
          i === -1 && (a2 = false, i = n2 + 1);
      return i === -1 ? "" : t3.slice(o, i);
    }, extname: function(t3) {
      e2(t3);
      for (var r3 = -1, n2 = 0, o = -1, i = true, a2 = 0, h = t3.length - 1; h >= 0; --h) {
        var s = t3.charCodeAt(h);
        if (s !== 47)
          o === -1 && (i = false, o = h + 1), s === 46 ? r3 === -1 ? r3 = h : a2 !== 1 && (a2 = 1) : r3 !== -1 && (a2 = -1);
        else if (!i) {
          n2 = h + 1;
          break;
        }
      }
      return r3 === -1 || o === -1 || a2 === 0 || a2 === 1 && r3 === o - 1 && r3 === n2 + 1 ? "" : t3.slice(r3, o);
    }, format: function(t3) {
      if (t3 === null || typeof t3 != "object")
        throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof t3);
      return function(t4, e3) {
        var r3 = e3.dir || e3.root, n2 = e3.base || (e3.name || "") + (e3.ext || "");
        return r3 ? r3 === e3.root ? r3 + n2 : r3 + "/" + n2 : n2;
      }(0, t3);
    }, parse: function(t3) {
      e2(t3);
      var r3 = { root: "", dir: "", base: "", ext: "", name: "" };
      if (t3.length === 0)
        return r3;
      var n2, o = t3.charCodeAt(0), i = o === 47;
      i ? (r3.root = "/", n2 = 1) : n2 = 0;
      for (var a2 = -1, h = 0, s = -1, f2 = true, u = t3.length - 1, c = 0; u >= n2; --u)
        if ((o = t3.charCodeAt(u)) !== 47)
          s === -1 && (f2 = false, s = u + 1), o === 46 ? a2 === -1 ? a2 = u : c !== 1 && (c = 1) : a2 !== -1 && (c = -1);
        else if (!f2) {
          h = u + 1;
          break;
        }
      return a2 === -1 || s === -1 || c === 0 || c === 1 && a2 === s - 1 && a2 === h + 1 ? s !== -1 && (r3.base = r3.name = h === 0 && i ? t3.slice(1, s) : t3.slice(h, s)) : (h === 0 && i ? (r3.name = t3.slice(1, a2), r3.base = t3.slice(1, s)) : (r3.name = t3.slice(h, a2), r3.base = t3.slice(h, s)), r3.ext = t3.slice(a2, s)), h > 0 ? r3.dir = t3.slice(0, h - 1) : i && (r3.dir = "/"), r3;
    }, sep: "/", delimiter: ":", win32: null, posix: null };
    n.posix = n, t2.exports = n;
  }, 447: (t2, e2, r2) => {
    var n;
    if (r2.r(e2), r2.d(e2, { URI: () => g, Utils: () => O }), typeof process == "object")
      n = process.platform === "win32";
    else if (typeof navigator == "object") {
      var o = navigator.userAgent;
      n = o.indexOf("Windows") >= 0;
    }
    var i, a2, h = (i = function(t3, e3) {
      return (i = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t4, e4) {
        t4.__proto__ = e4;
      } || function(t4, e4) {
        for (var r3 in e4)
          Object.prototype.hasOwnProperty.call(e4, r3) && (t4[r3] = e4[r3]);
      })(t3, e3);
    }, function(t3, e3) {
      function r3() {
        this.constructor = t3;
      }
      i(t3, e3), t3.prototype = e3 === null ? Object.create(e3) : (r3.prototype = e3.prototype, new r3());
    }), s = /^\w[\w\d+.-]*$/, f2 = /^\//, u = /^\/\//, c = "", l = "/", p = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/, g = function() {
      function t3(t4, e3, r3, n2, o2, i2) {
        i2 === void 0 && (i2 = false), typeof t4 == "object" ? (this.scheme = t4.scheme || c, this.authority = t4.authority || c, this.path = t4.path || c, this.query = t4.query || c, this.fragment = t4.fragment || c) : (this.scheme = function(t5, e4) {
          return t5 || e4 ? t5 : "file";
        }(t4, i2), this.authority = e3 || c, this.path = function(t5, e4) {
          switch (t5) {
            case "https":
            case "http":
            case "file":
              e4 ? e4[0] !== l && (e4 = l + e4) : e4 = l;
          }
          return e4;
        }(this.scheme, r3 || c), this.query = n2 || c, this.fragment = o2 || c, function(t5, e4) {
          if (!t5.scheme && e4)
            throw new Error('[UriError]: Scheme is missing: {scheme: "", authority: "' + t5.authority + '", path: "' + t5.path + '", query: "' + t5.query + '", fragment: "' + t5.fragment + '"}');
          if (t5.scheme && !s.test(t5.scheme))
            throw new Error("[UriError]: Scheme contains illegal characters.");
          if (t5.path) {
            if (t5.authority) {
              if (!f2.test(t5.path))
                throw new Error('[UriError]: If a URI contains an authority component, then the path component must either be empty or begin with a slash ("/") character');
            } else if (u.test(t5.path))
              throw new Error('[UriError]: If a URI does not contain an authority component, then the path cannot begin with two slash characters ("//")');
          }
        }(this, i2));
      }
      return t3.isUri = function(e3) {
        return e3 instanceof t3 || !!e3 && typeof e3.authority == "string" && typeof e3.fragment == "string" && typeof e3.path == "string" && typeof e3.query == "string" && typeof e3.scheme == "string" && typeof e3.fsPath == "function" && typeof e3.with == "function" && typeof e3.toString == "function";
      }, Object.defineProperty(t3.prototype, "fsPath", { get: function() {
        return C(this, false);
      }, enumerable: false, configurable: true }), t3.prototype.with = function(t4) {
        if (!t4)
          return this;
        var e3 = t4.scheme, r3 = t4.authority, n2 = t4.path, o2 = t4.query, i2 = t4.fragment;
        return e3 === void 0 ? e3 = this.scheme : e3 === null && (e3 = c), r3 === void 0 ? r3 = this.authority : r3 === null && (r3 = c), n2 === void 0 ? n2 = this.path : n2 === null && (n2 = c), o2 === void 0 ? o2 = this.query : o2 === null && (o2 = c), i2 === void 0 ? i2 = this.fragment : i2 === null && (i2 = c), e3 === this.scheme && r3 === this.authority && n2 === this.path && o2 === this.query && i2 === this.fragment ? this : new v(e3, r3, n2, o2, i2);
      }, t3.parse = function(t4, e3) {
        e3 === void 0 && (e3 = false);
        var r3 = p.exec(t4);
        return r3 ? new v(r3[2] || c, x(r3[4] || c), x(r3[5] || c), x(r3[7] || c), x(r3[9] || c), e3) : new v(c, c, c, c, c);
      }, t3.file = function(t4) {
        var e3 = c;
        if (n && (t4 = t4.replace(/\\/g, l)), t4[0] === l && t4[1] === l) {
          var r3 = t4.indexOf(l, 2);
          r3 === -1 ? (e3 = t4.substring(2), t4 = l) : (e3 = t4.substring(2, r3), t4 = t4.substring(r3) || l);
        }
        return new v("file", e3, t4, c, c);
      }, t3.from = function(t4) {
        return new v(t4.scheme, t4.authority, t4.path, t4.query, t4.fragment);
      }, t3.prototype.toString = function(t4) {
        return t4 === void 0 && (t4 = false), A2(this, t4);
      }, t3.prototype.toJSON = function() {
        return this;
      }, t3.revive = function(e3) {
        if (e3) {
          if (e3 instanceof t3)
            return e3;
          var r3 = new v(e3);
          return r3._formatted = e3.external, r3._fsPath = e3._sep === d ? e3.fsPath : null, r3;
        }
        return e3;
      }, t3;
    }(), d = n ? 1 : void 0, v = function(t3) {
      function e3() {
        var e4 = t3 !== null && t3.apply(this, arguments) || this;
        return e4._formatted = null, e4._fsPath = null, e4;
      }
      return h(e3, t3), Object.defineProperty(e3.prototype, "fsPath", { get: function() {
        return this._fsPath || (this._fsPath = C(this, false)), this._fsPath;
      }, enumerable: false, configurable: true }), e3.prototype.toString = function(t4) {
        return t4 === void 0 && (t4 = false), t4 ? A2(this, true) : (this._formatted || (this._formatted = A2(this, false)), this._formatted);
      }, e3.prototype.toJSON = function() {
        var t4 = { $mid: 1 };
        return this._fsPath && (t4.fsPath = this._fsPath, t4._sep = d), this._formatted && (t4.external = this._formatted), this.path && (t4.path = this.path), this.scheme && (t4.scheme = this.scheme), this.authority && (t4.authority = this.authority), this.query && (t4.query = this.query), this.fragment && (t4.fragment = this.fragment), t4;
      }, e3;
    }(g), m = ((a2 = {})[58] = "%3A", a2[47] = "%2F", a2[63] = "%3F", a2[35] = "%23", a2[91] = "%5B", a2[93] = "%5D", a2[64] = "%40", a2[33] = "%21", a2[36] = "%24", a2[38] = "%26", a2[39] = "%27", a2[40] = "%28", a2[41] = "%29", a2[42] = "%2A", a2[43] = "%2B", a2[44] = "%2C", a2[59] = "%3B", a2[61] = "%3D", a2[32] = "%20", a2);
    function y(t3, e3) {
      for (var r3 = void 0, n2 = -1, o2 = 0; o2 < t3.length; o2++) {
        var i2 = t3.charCodeAt(o2);
        if (i2 >= 97 && i2 <= 122 || i2 >= 65 && i2 <= 90 || i2 >= 48 && i2 <= 57 || i2 === 45 || i2 === 46 || i2 === 95 || i2 === 126 || e3 && i2 === 47)
          n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2, o2)), n2 = -1), r3 !== void 0 && (r3 += t3.charAt(o2));
        else {
          r3 === void 0 && (r3 = t3.substr(0, o2));
          var a3 = m[i2];
          a3 !== void 0 ? (n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2, o2)), n2 = -1), r3 += a3) : n2 === -1 && (n2 = o2);
        }
      }
      return n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2))), r3 !== void 0 ? r3 : t3;
    }
    function b(t3) {
      for (var e3 = void 0, r3 = 0; r3 < t3.length; r3++) {
        var n2 = t3.charCodeAt(r3);
        n2 === 35 || n2 === 63 ? (e3 === void 0 && (e3 = t3.substr(0, r3)), e3 += m[n2]) : e3 !== void 0 && (e3 += t3[r3]);
      }
      return e3 !== void 0 ? e3 : t3;
    }
    function C(t3, e3) {
      var r3;
      return r3 = t3.authority && t3.path.length > 1 && t3.scheme === "file" ? "//" + t3.authority + t3.path : t3.path.charCodeAt(0) === 47 && (t3.path.charCodeAt(1) >= 65 && t3.path.charCodeAt(1) <= 90 || t3.path.charCodeAt(1) >= 97 && t3.path.charCodeAt(1) <= 122) && t3.path.charCodeAt(2) === 58 ? e3 ? t3.path.substr(1) : t3.path[1].toLowerCase() + t3.path.substr(2) : t3.path, n && (r3 = r3.replace(/\//g, "\\")), r3;
    }
    function A2(t3, e3) {
      var r3 = e3 ? b : y, n2 = "", o2 = t3.scheme, i2 = t3.authority, a3 = t3.path, h2 = t3.query, s2 = t3.fragment;
      if (o2 && (n2 += o2, n2 += ":"), (i2 || o2 === "file") && (n2 += l, n2 += l), i2) {
        var f3 = i2.indexOf("@");
        if (f3 !== -1) {
          var u2 = i2.substr(0, f3);
          i2 = i2.substr(f3 + 1), (f3 = u2.indexOf(":")) === -1 ? n2 += r3(u2, false) : (n2 += r3(u2.substr(0, f3), false), n2 += ":", n2 += r3(u2.substr(f3 + 1), false)), n2 += "@";
        }
        (f3 = (i2 = i2.toLowerCase()).indexOf(":")) === -1 ? n2 += r3(i2, false) : (n2 += r3(i2.substr(0, f3), false), n2 += i2.substr(f3));
      }
      if (a3) {
        if (a3.length >= 3 && a3.charCodeAt(0) === 47 && a3.charCodeAt(2) === 58)
          (c2 = a3.charCodeAt(1)) >= 65 && c2 <= 90 && (a3 = "/" + String.fromCharCode(c2 + 32) + ":" + a3.substr(3));
        else if (a3.length >= 2 && a3.charCodeAt(1) === 58) {
          var c2;
          (c2 = a3.charCodeAt(0)) >= 65 && c2 <= 90 && (a3 = String.fromCharCode(c2 + 32) + ":" + a3.substr(2));
        }
        n2 += r3(a3, true);
      }
      return h2 && (n2 += "?", n2 += r3(h2, false)), s2 && (n2 += "#", n2 += e3 ? s2 : y(s2, false)), n2;
    }
    function w(t3) {
      try {
        return decodeURIComponent(t3);
      } catch (e3) {
        return t3.length > 3 ? t3.substr(0, 3) + w(t3.substr(3)) : t3;
      }
    }
    var _ = /(%[0-9A-Za-z][0-9A-Za-z])+/g;
    function x(t3) {
      return t3.match(_) ? t3.replace(_, function(t4) {
        return w(t4);
      }) : t3;
    }
    var O, P = r2(470), j = function() {
      for (var t3 = 0, e3 = 0, r3 = arguments.length; e3 < r3; e3++)
        t3 += arguments[e3].length;
      var n2 = Array(t3), o2 = 0;
      for (e3 = 0; e3 < r3; e3++)
        for (var i2 = arguments[e3], a3 = 0, h2 = i2.length; a3 < h2; a3++, o2++)
          n2[o2] = i2[a3];
      return n2;
    }, U = P.posix || P;
    !function(t3) {
      t3.joinPath = function(t4) {
        for (var e3 = [], r3 = 1; r3 < arguments.length; r3++)
          e3[r3 - 1] = arguments[r3];
        return t4.with({ path: U.join.apply(U, j([t4.path], e3)) });
      }, t3.resolvePath = function(t4) {
        for (var e3 = [], r3 = 1; r3 < arguments.length; r3++)
          e3[r3 - 1] = arguments[r3];
        var n2 = t4.path || "/";
        return t4.with({ path: U.resolve.apply(U, j([n2], e3)) });
      }, t3.dirname = function(t4) {
        var e3 = U.dirname(t4.path);
        return e3.length === 1 && e3.charCodeAt(0) === 46 ? t4 : t4.with({ path: e3 });
      }, t3.basename = function(t4) {
        return U.basename(t4.path);
      }, t3.extname = function(t4) {
        return U.extname(t4.path);
      };
    }(O || (O = {}));
  } }, e = {};
  function r(n) {
    if (e[n])
      return e[n].exports;
    var o = e[n] = { exports: {} };
    return t[n](o, o.exports, r), o.exports;
  }
  return r.d = (t2, e2) => {
    for (var n in e2)
      r.o(e2, n) && !r.o(t2, n) && Object.defineProperty(t2, n, { enumerable: true, get: e2[n] });
  }, r.o = (t2, e2) => Object.prototype.hasOwnProperty.call(t2, e2), r.r = (t2) => {
    typeof Symbol != "undefined" && Symbol.toStringTag && Object.defineProperty(t2, Symbol.toStringTag, { value: "Module" }), Object.defineProperty(t2, "__esModule", { value: true });
  }, r(447);
})();
const { URI, Utils } = LIB;
var __spreadArray = function(to, from, pack) {
  if (pack || arguments.length === 2)
    for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
        if (!ar)
          ar = Array.prototype.slice.call(from, 0, i);
        ar[i] = from[i];
      }
    }
  return to.concat(ar || Array.prototype.slice.call(from));
};
function dirname(uriString) {
  return Utils.dirname(URI.parse(uriString)).toString();
}
function joinPath(uriString) {
  var paths = [];
  for (var _i = 1; _i < arguments.length; _i++) {
    paths[_i - 1] = arguments[_i];
  }
  return Utils.joinPath.apply(Utils, __spreadArray([URI.parse(uriString)], paths, false)).toString();
}
var __awaiter$3 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator$3 = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f2, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f2)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f2 = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f2 = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var PathCompletionParticipant = function() {
  function PathCompletionParticipant2(readDirectory) {
    this.readDirectory = readDirectory;
    this.literalCompletions = [];
    this.importCompletions = [];
  }
  PathCompletionParticipant2.prototype.onCssURILiteralValue = function(context) {
    this.literalCompletions.push(context);
  };
  PathCompletionParticipant2.prototype.onCssImportPath = function(context) {
    this.importCompletions.push(context);
  };
  PathCompletionParticipant2.prototype.computeCompletions = function(document, documentContext) {
    return __awaiter$3(this, void 0, void 0, function() {
      var result, _i, _a2, literalCompletion, uriValue, fullValue, items, _b, items_1, item, _c, _d, importCompletion, pathValue, fullValue, suggestions, _e, suggestions_1, item;
      return __generator$3(this, function(_f2) {
        switch (_f2.label) {
          case 0:
            result = { items: [], isIncomplete: false };
            _i = 0, _a2 = this.literalCompletions;
            _f2.label = 1;
          case 1:
            if (!(_i < _a2.length))
              return [3, 5];
            literalCompletion = _a2[_i];
            uriValue = literalCompletion.uriValue;
            fullValue = stripQuotes(uriValue);
            if (!(fullValue === "." || fullValue === ".."))
              return [3, 2];
            result.isIncomplete = true;
            return [3, 4];
          case 2:
            return [4, this.providePathSuggestions(uriValue, literalCompletion.position, literalCompletion.range, document, documentContext)];
          case 3:
            items = _f2.sent();
            for (_b = 0, items_1 = items; _b < items_1.length; _b++) {
              item = items_1[_b];
              result.items.push(item);
            }
            _f2.label = 4;
          case 4:
            _i++;
            return [3, 1];
          case 5:
            _c = 0, _d = this.importCompletions;
            _f2.label = 6;
          case 6:
            if (!(_c < _d.length))
              return [3, 10];
            importCompletion = _d[_c];
            pathValue = importCompletion.pathValue;
            fullValue = stripQuotes(pathValue);
            if (!(fullValue === "." || fullValue === ".."))
              return [3, 7];
            result.isIncomplete = true;
            return [3, 9];
          case 7:
            return [4, this.providePathSuggestions(pathValue, importCompletion.position, importCompletion.range, document, documentContext)];
          case 8:
            suggestions = _f2.sent();
            if (document.languageId === "scss") {
              suggestions.forEach(function(s) {
                if (startsWith(s.label, "_") && endsWith(s.label, ".scss")) {
                  if (s.textEdit) {
                    s.textEdit.newText = s.label.slice(1, -5);
                  } else {
                    s.label = s.label.slice(1, -5);
                  }
                }
              });
            }
            for (_e = 0, suggestions_1 = suggestions; _e < suggestions_1.length; _e++) {
              item = suggestions_1[_e];
              result.items.push(item);
            }
            _f2.label = 9;
          case 9:
            _c++;
            return [3, 6];
          case 10:
            return [2, result];
        }
      });
    });
  };
  PathCompletionParticipant2.prototype.providePathSuggestions = function(pathValue, position, range, document, documentContext) {
    return __awaiter$3(this, void 0, void 0, function() {
      var fullValue, isValueQuoted, valueBeforeCursor, currentDocUri, fullValueRange, replaceRange, valueBeforeLastSlash, parentDir, result, infos, _i, infos_1, _a2, name, type;
      return __generator$3(this, function(_b) {
        switch (_b.label) {
          case 0:
            fullValue = stripQuotes(pathValue);
            isValueQuoted = startsWith(pathValue, "'") || startsWith(pathValue, '"');
            valueBeforeCursor = isValueQuoted ? fullValue.slice(0, position.character - (range.start.character + 1)) : fullValue.slice(0, position.character - range.start.character);
            currentDocUri = document.uri;
            fullValueRange = isValueQuoted ? shiftRange(range, 1, -1) : range;
            replaceRange = pathToReplaceRange(valueBeforeCursor, fullValue, fullValueRange);
            valueBeforeLastSlash = valueBeforeCursor.substring(0, valueBeforeCursor.lastIndexOf("/") + 1);
            parentDir = documentContext.resolveReference(valueBeforeLastSlash || ".", currentDocUri);
            if (!parentDir)
              return [3, 4];
            _b.label = 1;
          case 1:
            _b.trys.push([1, 3, , 4]);
            result = [];
            return [4, this.readDirectory(parentDir)];
          case 2:
            infos = _b.sent();
            for (_i = 0, infos_1 = infos; _i < infos_1.length; _i++) {
              _a2 = infos_1[_i], name = _a2[0], type = _a2[1];
              if (name.charCodeAt(0) !== CharCode_dot && (type === FileType.Directory || joinPath(parentDir, name) !== currentDocUri)) {
                result.push(createCompletionItem(name, type === FileType.Directory, replaceRange));
              }
            }
            return [2, result];
          case 3:
            _b.sent();
            return [3, 4];
          case 4:
            return [2, []];
        }
      });
    });
  };
  return PathCompletionParticipant2;
}();
var CharCode_dot = ".".charCodeAt(0);
function stripQuotes(fullValue) {
  if (startsWith(fullValue, "'") || startsWith(fullValue, '"')) {
    return fullValue.slice(1, -1);
  } else {
    return fullValue;
  }
}
function pathToReplaceRange(valueBeforeCursor, fullValue, fullValueRange) {
  var replaceRange;
  var lastIndexOfSlash = valueBeforeCursor.lastIndexOf("/");
  if (lastIndexOfSlash === -1) {
    replaceRange = fullValueRange;
  } else {
    var valueAfterLastSlash = fullValue.slice(lastIndexOfSlash + 1);
    var startPos = shiftPosition(fullValueRange.end, -valueAfterLastSlash.length);
    var whitespaceIndex = valueAfterLastSlash.indexOf(" ");
    var endPos = void 0;
    if (whitespaceIndex !== -1) {
      endPos = shiftPosition(startPos, whitespaceIndex);
    } else {
      endPos = fullValueRange.end;
    }
    replaceRange = Range.create(startPos, endPos);
  }
  return replaceRange;
}
function createCompletionItem(name, isDir, replaceRange) {
  if (isDir) {
    name = name + "/";
    return {
      label: escapePath(name),
      kind: CompletionItemKind.Folder,
      textEdit: TextEdit.replace(replaceRange, escapePath(name)),
      command: {
        title: "Suggest",
        command: "editor.action.triggerSuggest"
      }
    };
  } else {
    return {
      label: escapePath(name),
      kind: CompletionItemKind.File,
      textEdit: TextEdit.replace(replaceRange, escapePath(name))
    };
  }
}
function escapePath(p) {
  return p.replace(/(\s|\(|\)|,|"|')/g, "\\$1");
}
function shiftPosition(pos, offset) {
  return Position.create(pos.line, pos.character + offset);
}
function shiftRange(range, startOffset, endOffset) {
  var start = shiftPosition(range.start, startOffset);
  var end = shiftPosition(range.end, endOffset);
  return Range.create(start, end);
}
var __awaiter$2 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator$2 = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f2, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f2)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f2 = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f2 = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var localize$5 = loadMessageBundle();
var SnippetFormat = InsertTextFormat.Snippet;
var SortTexts;
(function(SortTexts2) {
  SortTexts2["Enums"] = " ";
  SortTexts2["Normal"] = "d";
  SortTexts2["VendorPrefixed"] = "x";
  SortTexts2["Term"] = "y";
  SortTexts2["Variable"] = "z";
})(SortTexts || (SortTexts = {}));
var CSSCompletion = function() {
  function CSSCompletion2(variablePrefix, lsOptions, cssDataManager) {
    if (variablePrefix === void 0) {
      variablePrefix = null;
    }
    this.variablePrefix = variablePrefix;
    this.lsOptions = lsOptions;
    this.cssDataManager = cssDataManager;
    this.completionParticipants = [];
  }
  CSSCompletion2.prototype.configure = function(settings) {
    this.defaultSettings = settings;
  };
  CSSCompletion2.prototype.getSymbolContext = function() {
    if (!this.symbolContext) {
      this.symbolContext = new Symbols(this.styleSheet);
    }
    return this.symbolContext;
  };
  CSSCompletion2.prototype.setCompletionParticipants = function(registeredCompletionParticipants) {
    this.completionParticipants = registeredCompletionParticipants || [];
  };
  CSSCompletion2.prototype.doComplete2 = function(document, position, styleSheet, documentContext, completionSettings) {
    if (completionSettings === void 0) {
      completionSettings = this.defaultSettings;
    }
    return __awaiter$2(this, void 0, void 0, function() {
      var participant, contributedParticipants, result, pathCompletionResult;
      return __generator$2(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            if (!this.lsOptions.fileSystemProvider || !this.lsOptions.fileSystemProvider.readDirectory) {
              return [2, this.doComplete(document, position, styleSheet, completionSettings)];
            }
            participant = new PathCompletionParticipant(this.lsOptions.fileSystemProvider.readDirectory);
            contributedParticipants = this.completionParticipants;
            this.completionParticipants = [participant].concat(contributedParticipants);
            result = this.doComplete(document, position, styleSheet, completionSettings);
            _a2.label = 1;
          case 1:
            _a2.trys.push([1, , 3, 4]);
            return [4, participant.computeCompletions(document, documentContext)];
          case 2:
            pathCompletionResult = _a2.sent();
            return [2, {
              isIncomplete: result.isIncomplete || pathCompletionResult.isIncomplete,
              items: pathCompletionResult.items.concat(result.items)
            }];
          case 3:
            this.completionParticipants = contributedParticipants;
            return [7];
          case 4:
            return [2];
        }
      });
    });
  };
  CSSCompletion2.prototype.doComplete = function(document, position, styleSheet, documentSettings) {
    this.offset = document.offsetAt(position);
    this.position = position;
    this.currentWord = getCurrentWord(document, this.offset);
    this.defaultReplaceRange = Range.create(Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
    this.textDocument = document;
    this.styleSheet = styleSheet;
    this.documentSettings = documentSettings;
    try {
      var result = { isIncomplete: false, items: [] };
      this.nodePath = getNodePath(this.styleSheet, this.offset);
      for (var i = this.nodePath.length - 1; i >= 0; i--) {
        var node = this.nodePath[i];
        if (node instanceof Property) {
          this.getCompletionsForDeclarationProperty(node.getParent(), result);
        } else if (node instanceof Expression) {
          if (node.parent instanceof Interpolation) {
            this.getVariableProposals(null, result);
          } else {
            this.getCompletionsForExpression(node, result);
          }
        } else if (node instanceof SimpleSelector) {
          var parentRef = node.findAParent(NodeType.ExtendsReference, NodeType.Ruleset);
          if (parentRef) {
            if (parentRef.type === NodeType.ExtendsReference) {
              this.getCompletionsForExtendsReference(parentRef, node, result);
            } else {
              var parentRuleSet = parentRef;
              this.getCompletionsForSelector(parentRuleSet, parentRuleSet && parentRuleSet.isNested(), result);
            }
          }
        } else if (node instanceof FunctionArgument) {
          this.getCompletionsForFunctionArgument(node, node.getParent(), result);
        } else if (node instanceof Declarations) {
          this.getCompletionsForDeclarations(node, result);
        } else if (node instanceof VariableDeclaration) {
          this.getCompletionsForVariableDeclaration(node, result);
        } else if (node instanceof RuleSet) {
          this.getCompletionsForRuleSet(node, result);
        } else if (node instanceof Interpolation) {
          this.getCompletionsForInterpolation(node, result);
        } else if (node instanceof FunctionDeclaration) {
          this.getCompletionsForFunctionDeclaration(node, result);
        } else if (node instanceof MixinReference) {
          this.getCompletionsForMixinReference(node, result);
        } else if (node instanceof Function) {
          this.getCompletionsForFunctionArgument(null, node, result);
        } else if (node instanceof Supports) {
          this.getCompletionsForSupports(node, result);
        } else if (node instanceof SupportsCondition) {
          this.getCompletionsForSupportsCondition(node, result);
        } else if (node instanceof ExtendsReference) {
          this.getCompletionsForExtendsReference(node, null, result);
        } else if (node.type === NodeType.URILiteral) {
          this.getCompletionForUriLiteralValue(node, result);
        } else if (node.parent === null) {
          this.getCompletionForTopLevel(result);
        } else if (node.type === NodeType.StringLiteral && this.isImportPathParent(node.parent.type)) {
          this.getCompletionForImportPath(node, result);
        } else {
          continue;
        }
        if (result.items.length > 0 || this.offset > node.offset) {
          return this.finalize(result);
        }
      }
      this.getCompletionsForStylesheet(result);
      if (result.items.length === 0) {
        if (this.variablePrefix && this.currentWord.indexOf(this.variablePrefix) === 0) {
          this.getVariableProposals(null, result);
        }
      }
      return this.finalize(result);
    } finally {
      this.position = null;
      this.currentWord = null;
      this.textDocument = null;
      this.styleSheet = null;
      this.symbolContext = null;
      this.defaultReplaceRange = null;
      this.nodePath = null;
    }
  };
  CSSCompletion2.prototype.isImportPathParent = function(type) {
    return type === NodeType.Import;
  };
  CSSCompletion2.prototype.finalize = function(result) {
    return result;
  };
  CSSCompletion2.prototype.findInNodePath = function() {
    var types = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      types[_i] = arguments[_i];
    }
    for (var i = this.nodePath.length - 1; i >= 0; i--) {
      var node = this.nodePath[i];
      if (types.indexOf(node.type) !== -1) {
        return node;
      }
    }
    return null;
  };
  CSSCompletion2.prototype.getCompletionsForDeclarationProperty = function(declaration, result) {
    return this.getPropertyProposals(declaration, result);
  };
  CSSCompletion2.prototype.getPropertyProposals = function(declaration, result) {
    var _this = this;
    var triggerPropertyValueCompletion = this.isTriggerPropertyValueCompletionEnabled;
    var completePropertyWithSemicolon = this.isCompletePropertyWithSemicolonEnabled;
    var properties = this.cssDataManager.getProperties();
    properties.forEach(function(entry) {
      var range;
      var insertText;
      var retrigger = false;
      if (declaration) {
        range = _this.getCompletionRange(declaration.getProperty());
        insertText = entry.name;
        if (!isDefined(declaration.colonPosition)) {
          insertText += ": ";
          retrigger = true;
        }
      } else {
        range = _this.getCompletionRange(null);
        insertText = entry.name + ": ";
        retrigger = true;
      }
      if (!declaration && completePropertyWithSemicolon) {
        insertText += "$0;";
      }
      if (declaration && !declaration.semicolonPosition) {
        if (completePropertyWithSemicolon && _this.offset >= _this.textDocument.offsetAt(range.end)) {
          insertText += "$0;";
        }
      }
      var item = {
        label: entry.name,
        documentation: getEntryDescription(entry, _this.doesSupportMarkdown()),
        tags: isDeprecated(entry) ? [CompletionItemTag.Deprecated] : [],
        textEdit: TextEdit.replace(range, insertText),
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Property
      };
      if (!entry.restrictions) {
        retrigger = false;
      }
      if (triggerPropertyValueCompletion && retrigger) {
        item.command = {
          title: "Suggest",
          command: "editor.action.triggerSuggest"
        };
      }
      var relevance = typeof entry.relevance === "number" ? Math.min(Math.max(entry.relevance, 0), 99) : 50;
      var sortTextSuffix = (255 - relevance).toString(16);
      var sortTextPrefix = startsWith(entry.name, "-") ? SortTexts.VendorPrefixed : SortTexts.Normal;
      item.sortText = sortTextPrefix + "_" + sortTextSuffix;
      result.items.push(item);
    });
    this.completionParticipants.forEach(function(participant) {
      if (participant.onCssProperty) {
        participant.onCssProperty({
          propertyName: _this.currentWord,
          range: _this.defaultReplaceRange
        });
      }
    });
    return result;
  };
  Object.defineProperty(CSSCompletion2.prototype, "isTriggerPropertyValueCompletionEnabled", {
    get: function() {
      var _a2, _b;
      return (_b = (_a2 = this.documentSettings) === null || _a2 === void 0 ? void 0 : _a2.triggerPropertyValueCompletion) !== null && _b !== void 0 ? _b : true;
    },
    enumerable: false,
    configurable: true
  });
  Object.defineProperty(CSSCompletion2.prototype, "isCompletePropertyWithSemicolonEnabled", {
    get: function() {
      var _a2, _b;
      return (_b = (_a2 = this.documentSettings) === null || _a2 === void 0 ? void 0 : _a2.completePropertyWithSemicolon) !== null && _b !== void 0 ? _b : true;
    },
    enumerable: false,
    configurable: true
  });
  CSSCompletion2.prototype.getCompletionsForDeclarationValue = function(node, result) {
    var _this = this;
    var propertyName = node.getFullPropertyName();
    var entry = this.cssDataManager.getProperty(propertyName);
    var existingNode = node.getValue() || null;
    while (existingNode && existingNode.hasChildren()) {
      existingNode = existingNode.findChildAtOffset(this.offset, false);
    }
    this.completionParticipants.forEach(function(participant) {
      if (participant.onCssPropertyValue) {
        participant.onCssPropertyValue({
          propertyName,
          propertyValue: _this.currentWord,
          range: _this.getCompletionRange(existingNode)
        });
      }
    });
    if (entry) {
      if (entry.restrictions) {
        for (var _i = 0, _a2 = entry.restrictions; _i < _a2.length; _i++) {
          var restriction = _a2[_i];
          switch (restriction) {
            case "color":
              this.getColorProposals(entry, existingNode, result);
              break;
            case "position":
              this.getPositionProposals(entry, existingNode, result);
              break;
            case "repeat":
              this.getRepeatStyleProposals(entry, existingNode, result);
              break;
            case "line-style":
              this.getLineStyleProposals(entry, existingNode, result);
              break;
            case "line-width":
              this.getLineWidthProposals(entry, existingNode, result);
              break;
            case "geometry-box":
              this.getGeometryBoxProposals(entry, existingNode, result);
              break;
            case "box":
              this.getBoxProposals(entry, existingNode, result);
              break;
            case "image":
              this.getImageProposals(entry, existingNode, result);
              break;
            case "timing-function":
              this.getTimingFunctionProposals(entry, existingNode, result);
              break;
            case "shape":
              this.getBasicShapeProposals(entry, existingNode, result);
              break;
          }
        }
      }
      this.getValueEnumProposals(entry, existingNode, result);
      this.getCSSWideKeywordProposals(entry, existingNode, result);
      this.getUnitProposals(entry, existingNode, result);
    } else {
      var existingValues = collectValues(this.styleSheet, node);
      for (var _b = 0, _c = existingValues.getEntries(); _b < _c.length; _b++) {
        var existingValue = _c[_b];
        result.items.push({
          label: existingValue,
          textEdit: TextEdit.replace(this.getCompletionRange(existingNode), existingValue),
          kind: CompletionItemKind.Value
        });
      }
    }
    this.getVariableProposals(existingNode, result);
    this.getTermProposals(entry, existingNode, result);
    return result;
  };
  CSSCompletion2.prototype.getValueEnumProposals = function(entry, existingNode, result) {
    if (entry.values) {
      for (var _i = 0, _a2 = entry.values; _i < _a2.length; _i++) {
        var value = _a2[_i];
        var insertString = value.name;
        var insertTextFormat = void 0;
        if (endsWith(insertString, ")")) {
          var from = insertString.lastIndexOf("(");
          if (from !== -1) {
            insertString = insertString.substr(0, from) + "($1)";
            insertTextFormat = SnippetFormat;
          }
        }
        var sortText = SortTexts.Enums;
        if (startsWith(value.name, "-")) {
          sortText += SortTexts.VendorPrefixed;
        }
        var item = {
          label: value.name,
          documentation: getEntryDescription(value, this.doesSupportMarkdown()),
          tags: isDeprecated(entry) ? [CompletionItemTag.Deprecated] : [],
          textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertString),
          sortText,
          kind: CompletionItemKind.Value,
          insertTextFormat
        };
        result.items.push(item);
      }
    }
    return result;
  };
  CSSCompletion2.prototype.getCSSWideKeywordProposals = function(entry, existingNode, result) {
    for (var keywords in cssWideKeywords) {
      result.items.push({
        label: keywords,
        documentation: cssWideKeywords[keywords],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), keywords),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForInterpolation = function(node, result) {
    if (this.offset >= node.offset + 2) {
      this.getVariableProposals(null, result);
    }
    return result;
  };
  CSSCompletion2.prototype.getVariableProposals = function(existingNode, result) {
    var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, ReferenceType.Variable);
    for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
      var symbol = symbols_1[_i];
      var insertText = startsWith(symbol.name, "--") ? "var(" + symbol.name + ")" : symbol.name;
      var completionItem = {
        label: symbol.name,
        documentation: symbol.value ? getLimitedString(symbol.value) : symbol.value,
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
        kind: CompletionItemKind.Variable,
        sortText: SortTexts.Variable
      };
      if (typeof completionItem.documentation === "string" && isColorString(completionItem.documentation)) {
        completionItem.kind = CompletionItemKind.Color;
      }
      if (symbol.node.type === NodeType.FunctionParameter) {
        var mixinNode = symbol.node.getParent();
        if (mixinNode.type === NodeType.MixinDeclaration) {
          completionItem.detail = localize$5("completion.argument", "argument from '{0}'", mixinNode.getName());
        }
      }
      result.items.push(completionItem);
    }
    return result;
  };
  CSSCompletion2.prototype.getVariableProposalsForCSSVarFunction = function(result) {
    var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, ReferenceType.Variable);
    symbols = symbols.filter(function(symbol2) {
      return startsWith(symbol2.name, "--");
    });
    for (var _i = 0, symbols_2 = symbols; _i < symbols_2.length; _i++) {
      var symbol = symbols_2[_i];
      var completionItem = {
        label: symbol.name,
        documentation: symbol.value ? getLimitedString(symbol.value) : symbol.value,
        textEdit: TextEdit.replace(this.getCompletionRange(null), symbol.name),
        kind: CompletionItemKind.Variable
      };
      if (typeof completionItem.documentation === "string" && isColorString(completionItem.documentation)) {
        completionItem.kind = CompletionItemKind.Color;
      }
      result.items.push(completionItem);
    }
    return result;
  };
  CSSCompletion2.prototype.getUnitProposals = function(entry, existingNode, result) {
    var currentWord = "0";
    if (this.currentWord.length > 0) {
      var numMatch = this.currentWord.match(/^-?\d[\.\d+]*/);
      if (numMatch) {
        currentWord = numMatch[0];
        result.isIncomplete = currentWord.length === this.currentWord.length;
      }
    } else if (this.currentWord.length === 0) {
      result.isIncomplete = true;
    }
    if (existingNode && existingNode.parent && existingNode.parent.type === NodeType.Term) {
      existingNode = existingNode.getParent();
    }
    if (entry.restrictions) {
      for (var _i = 0, _a2 = entry.restrictions; _i < _a2.length; _i++) {
        var restriction = _a2[_i];
        var units$1 = units[restriction];
        if (units$1) {
          for (var _b = 0, units_1 = units$1; _b < units_1.length; _b++) {
            var unit = units_1[_b];
            var insertText = currentWord + unit;
            result.items.push({
              label: insertText,
              textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
              kind: CompletionItemKind.Unit
            });
          }
        }
      }
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionRange = function(existingNode) {
    if (existingNode && existingNode.offset <= this.offset && this.offset <= existingNode.end) {
      var end = existingNode.end !== -1 ? this.textDocument.positionAt(existingNode.end) : this.position;
      var start = this.textDocument.positionAt(existingNode.offset);
      if (start.line === end.line) {
        return Range.create(start, end);
      }
    }
    return this.defaultReplaceRange;
  };
  CSSCompletion2.prototype.getColorProposals = function(entry, existingNode, result) {
    for (var color in colors) {
      result.items.push({
        label: color,
        documentation: colors[color],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
        kind: CompletionItemKind.Color
      });
    }
    for (var color in colorKeywords) {
      result.items.push({
        label: color,
        documentation: colorKeywords[color],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
        kind: CompletionItemKind.Value
      });
    }
    var colorValues = new Set();
    this.styleSheet.acceptVisitor(new ColorValueCollector(colorValues, this.offset));
    for (var _i = 0, _a2 = colorValues.getEntries(); _i < _a2.length; _i++) {
      var color = _a2[_i];
      result.items.push({
        label: color,
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), color),
        kind: CompletionItemKind.Color
      });
    }
    var _loop_1 = function(p2) {
      var tabStop = 1;
      var replaceFunction = function(_match, p1) {
        return "${" + tabStop++ + ":" + p1 + "}";
      };
      var insertText = p2.func.replace(/\[?\$(\w+)\]?/g, replaceFunction);
      result.items.push({
        label: p2.func.substr(0, p2.func.indexOf("(")),
        detail: p2.func,
        documentation: p2.desc,
        textEdit: TextEdit.replace(this_1.getCompletionRange(existingNode), insertText),
        insertTextFormat: SnippetFormat,
        kind: CompletionItemKind.Function
      });
    };
    var this_1 = this;
    for (var _b = 0, _c = colorFunctions; _b < _c.length; _b++) {
      var p = _c[_b];
      _loop_1(p);
    }
    return result;
  };
  CSSCompletion2.prototype.getPositionProposals = function(entry, existingNode, result) {
    for (var position in positionKeywords) {
      result.items.push({
        label: position,
        documentation: positionKeywords[position],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), position),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getRepeatStyleProposals = function(entry, existingNode, result) {
    for (var repeat in repeatStyleKeywords) {
      result.items.push({
        label: repeat,
        documentation: repeatStyleKeywords[repeat],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), repeat),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getLineStyleProposals = function(entry, existingNode, result) {
    for (var lineStyle in lineStyleKeywords) {
      result.items.push({
        label: lineStyle,
        documentation: lineStyleKeywords[lineStyle],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineStyle),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getLineWidthProposals = function(entry, existingNode, result) {
    for (var _i = 0, _a2 = lineWidthKeywords; _i < _a2.length; _i++) {
      var lineWidth = _a2[_i];
      result.items.push({
        label: lineWidth,
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), lineWidth),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getGeometryBoxProposals = function(entry, existingNode, result) {
    for (var box in geometryBoxKeywords) {
      result.items.push({
        label: box,
        documentation: geometryBoxKeywords[box],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getBoxProposals = function(entry, existingNode, result) {
    for (var box in boxKeywords) {
      result.items.push({
        label: box,
        documentation: boxKeywords[box],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), box),
        kind: CompletionItemKind.Value
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getImageProposals = function(entry, existingNode, result) {
    for (var image in imageFunctions) {
      var insertText = moveCursorInsideParenthesis(image);
      result.items.push({
        label: image,
        documentation: imageFunctions[image],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
        kind: CompletionItemKind.Function,
        insertTextFormat: image !== insertText ? SnippetFormat : void 0
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getTimingFunctionProposals = function(entry, existingNode, result) {
    for (var timing in transitionTimingFunctions) {
      var insertText = moveCursorInsideParenthesis(timing);
      result.items.push({
        label: timing,
        documentation: transitionTimingFunctions[timing],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
        kind: CompletionItemKind.Function,
        insertTextFormat: timing !== insertText ? SnippetFormat : void 0
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getBasicShapeProposals = function(entry, existingNode, result) {
    for (var shape in basicShapeFunctions) {
      var insertText = moveCursorInsideParenthesis(shape);
      result.items.push({
        label: shape,
        documentation: basicShapeFunctions[shape],
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
        kind: CompletionItemKind.Function,
        insertTextFormat: shape !== insertText ? SnippetFormat : void 0
      });
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForStylesheet = function(result) {
    var node = this.styleSheet.findFirstChildBeforeOffset(this.offset);
    if (!node) {
      return this.getCompletionForTopLevel(result);
    }
    if (node instanceof RuleSet) {
      return this.getCompletionsForRuleSet(node, result);
    }
    if (node instanceof Supports) {
      return this.getCompletionsForSupports(node, result);
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionForTopLevel = function(result) {
    var _this = this;
    this.cssDataManager.getAtDirectives().forEach(function(entry) {
      result.items.push({
        label: entry.name,
        textEdit: TextEdit.replace(_this.getCompletionRange(null), entry.name),
        documentation: getEntryDescription(entry, _this.doesSupportMarkdown()),
        tags: isDeprecated(entry) ? [CompletionItemTag.Deprecated] : [],
        kind: CompletionItemKind.Keyword
      });
    });
    this.getCompletionsForSelector(null, false, result);
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForRuleSet = function(ruleSet, result) {
    var declarations = ruleSet.getDeclarations();
    var isAfter = declarations && declarations.endsWith("}") && this.offset >= declarations.end;
    if (isAfter) {
      return this.getCompletionForTopLevel(result);
    }
    var isInSelectors = !declarations || this.offset <= declarations.offset;
    if (isInSelectors) {
      return this.getCompletionsForSelector(ruleSet, ruleSet.isNested(), result);
    }
    return this.getCompletionsForDeclarations(ruleSet.getDeclarations(), result);
  };
  CSSCompletion2.prototype.getCompletionsForSelector = function(ruleSet, isNested, result) {
    var _this = this;
    var existingNode = this.findInNodePath(NodeType.PseudoSelector, NodeType.IdentifierSelector, NodeType.ClassSelector, NodeType.ElementNameSelector);
    if (!existingNode && this.hasCharacterAtPosition(this.offset - this.currentWord.length - 1, ":")) {
      this.currentWord = ":" + this.currentWord;
      if (this.hasCharacterAtPosition(this.offset - this.currentWord.length - 1, ":")) {
        this.currentWord = ":" + this.currentWord;
      }
      this.defaultReplaceRange = Range.create(Position.create(this.position.line, this.position.character - this.currentWord.length), this.position);
    }
    var pseudoClasses = this.cssDataManager.getPseudoClasses();
    pseudoClasses.forEach(function(entry2) {
      var insertText = moveCursorInsideParenthesis(entry2.name);
      var item = {
        label: entry2.name,
        textEdit: TextEdit.replace(_this.getCompletionRange(existingNode), insertText),
        documentation: getEntryDescription(entry2, _this.doesSupportMarkdown()),
        tags: isDeprecated(entry2) ? [CompletionItemTag.Deprecated] : [],
        kind: CompletionItemKind.Function,
        insertTextFormat: entry2.name !== insertText ? SnippetFormat : void 0
      };
      if (startsWith(entry2.name, ":-")) {
        item.sortText = SortTexts.VendorPrefixed;
      }
      result.items.push(item);
    });
    var pseudoElements = this.cssDataManager.getPseudoElements();
    pseudoElements.forEach(function(entry2) {
      var insertText = moveCursorInsideParenthesis(entry2.name);
      var item = {
        label: entry2.name,
        textEdit: TextEdit.replace(_this.getCompletionRange(existingNode), insertText),
        documentation: getEntryDescription(entry2, _this.doesSupportMarkdown()),
        tags: isDeprecated(entry2) ? [CompletionItemTag.Deprecated] : [],
        kind: CompletionItemKind.Function,
        insertTextFormat: entry2.name !== insertText ? SnippetFormat : void 0
      };
      if (startsWith(entry2.name, "::-")) {
        item.sortText = SortTexts.VendorPrefixed;
      }
      result.items.push(item);
    });
    if (!isNested) {
      for (var _i = 0, _a2 = html5Tags; _i < _a2.length; _i++) {
        var entry = _a2[_i];
        result.items.push({
          label: entry,
          textEdit: TextEdit.replace(this.getCompletionRange(existingNode), entry),
          kind: CompletionItemKind.Keyword
        });
      }
      for (var _b = 0, _c = svgElements; _b < _c.length; _b++) {
        var entry = _c[_b];
        result.items.push({
          label: entry,
          textEdit: TextEdit.replace(this.getCompletionRange(existingNode), entry),
          kind: CompletionItemKind.Keyword
        });
      }
    }
    var visited = {};
    visited[this.currentWord] = true;
    var docText = this.textDocument.getText();
    this.styleSheet.accept(function(n) {
      if (n.type === NodeType.SimpleSelector && n.length > 0) {
        var selector2 = docText.substr(n.offset, n.length);
        if (selector2.charAt(0) === "." && !visited[selector2]) {
          visited[selector2] = true;
          result.items.push({
            label: selector2,
            textEdit: TextEdit.replace(_this.getCompletionRange(existingNode), selector2),
            kind: CompletionItemKind.Keyword
          });
        }
        return false;
      }
      return true;
    });
    if (ruleSet && ruleSet.isNested()) {
      var selector = ruleSet.getSelectors().findFirstChildBeforeOffset(this.offset);
      if (selector && ruleSet.getSelectors().getChildren().indexOf(selector) === 0) {
        this.getPropertyProposals(null, result);
      }
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForDeclarations = function(declarations, result) {
    if (!declarations || this.offset === declarations.offset) {
      return result;
    }
    var node = declarations.findFirstChildBeforeOffset(this.offset);
    if (!node) {
      return this.getCompletionsForDeclarationProperty(null, result);
    }
    if (node instanceof AbstractDeclaration) {
      var declaration = node;
      if (!isDefined(declaration.colonPosition) || this.offset <= declaration.colonPosition) {
        return this.getCompletionsForDeclarationProperty(declaration, result);
      } else if (isDefined(declaration.semicolonPosition) && declaration.semicolonPosition < this.offset) {
        if (this.offset === declaration.semicolonPosition + 1) {
          return result;
        }
        return this.getCompletionsForDeclarationProperty(null, result);
      }
      if (declaration instanceof Declaration) {
        return this.getCompletionsForDeclarationValue(declaration, result);
      }
    } else if (node instanceof ExtendsReference) {
      this.getCompletionsForExtendsReference(node, null, result);
    } else if (this.currentWord && this.currentWord[0] === "@") {
      this.getCompletionsForDeclarationProperty(null, result);
    } else if (node instanceof RuleSet) {
      this.getCompletionsForDeclarationProperty(null, result);
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForVariableDeclaration = function(declaration, result) {
    if (this.offset && isDefined(declaration.colonPosition) && this.offset > declaration.colonPosition) {
      this.getVariableProposals(declaration.getValue(), result);
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForExpression = function(expression, result) {
    var parent = expression.getParent();
    if (parent instanceof FunctionArgument) {
      this.getCompletionsForFunctionArgument(parent, parent.getParent(), result);
      return result;
    }
    var declaration = expression.findParent(NodeType.Declaration);
    if (!declaration) {
      this.getTermProposals(void 0, null, result);
      return result;
    }
    var node = expression.findChildAtOffset(this.offset, true);
    if (!node) {
      return this.getCompletionsForDeclarationValue(declaration, result);
    }
    if (node instanceof NumericValue || node instanceof Identifier) {
      return this.getCompletionsForDeclarationValue(declaration, result);
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForFunctionArgument = function(arg, func, result) {
    var identifier = func.getIdentifier();
    if (identifier && identifier.matches("var")) {
      if (!func.getArguments().hasChildren() || func.getArguments().getChild(0) === arg) {
        this.getVariableProposalsForCSSVarFunction(result);
      }
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForFunctionDeclaration = function(decl, result) {
    var declarations = decl.getDeclarations();
    if (declarations && this.offset > declarations.offset && this.offset < declarations.end) {
      this.getTermProposals(void 0, null, result);
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForMixinReference = function(ref, result) {
    var _this = this;
    var allMixins = this.getSymbolContext().findSymbolsAtOffset(this.offset, ReferenceType.Mixin);
    for (var _i = 0, allMixins_1 = allMixins; _i < allMixins_1.length; _i++) {
      var mixinSymbol = allMixins_1[_i];
      if (mixinSymbol.node instanceof MixinDeclaration) {
        result.items.push(this.makeTermProposal(mixinSymbol, mixinSymbol.node.getParameters(), null));
      }
    }
    var identifierNode = ref.getIdentifier() || null;
    this.completionParticipants.forEach(function(participant) {
      if (participant.onCssMixinReference) {
        participant.onCssMixinReference({
          mixinName: _this.currentWord,
          range: _this.getCompletionRange(identifierNode)
        });
      }
    });
    return result;
  };
  CSSCompletion2.prototype.getTermProposals = function(entry, existingNode, result) {
    var allFunctions = this.getSymbolContext().findSymbolsAtOffset(this.offset, ReferenceType.Function);
    for (var _i = 0, allFunctions_1 = allFunctions; _i < allFunctions_1.length; _i++) {
      var functionSymbol = allFunctions_1[_i];
      if (functionSymbol.node instanceof FunctionDeclaration) {
        result.items.push(this.makeTermProposal(functionSymbol, functionSymbol.node.getParameters(), existingNode));
      }
    }
    return result;
  };
  CSSCompletion2.prototype.makeTermProposal = function(symbol, parameters, existingNode) {
    symbol.node;
    var params = parameters.getChildren().map(function(c) {
      return c instanceof FunctionParameter ? c.getName() : c.getText();
    });
    var insertText = symbol.name + "(" + params.map(function(p, index) {
      return "${" + (index + 1) + ":" + p + "}";
    }).join(", ") + ")";
    return {
      label: symbol.name,
      detail: symbol.name + "(" + params.join(", ") + ")",
      textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
      insertTextFormat: SnippetFormat,
      kind: CompletionItemKind.Function,
      sortText: SortTexts.Term
    };
  };
  CSSCompletion2.prototype.getCompletionsForSupportsCondition = function(supportsCondition, result) {
    var child = supportsCondition.findFirstChildBeforeOffset(this.offset);
    if (child) {
      if (child instanceof Declaration) {
        if (!isDefined(child.colonPosition) || this.offset <= child.colonPosition) {
          return this.getCompletionsForDeclarationProperty(child, result);
        } else {
          return this.getCompletionsForDeclarationValue(child, result);
        }
      } else if (child instanceof SupportsCondition) {
        return this.getCompletionsForSupportsCondition(child, result);
      }
    }
    if (isDefined(supportsCondition.lParent) && this.offset > supportsCondition.lParent && (!isDefined(supportsCondition.rParent) || this.offset <= supportsCondition.rParent)) {
      return this.getCompletionsForDeclarationProperty(null, result);
    }
    return result;
  };
  CSSCompletion2.prototype.getCompletionsForSupports = function(supports, result) {
    var declarations = supports.getDeclarations();
    var inInCondition = !declarations || this.offset <= declarations.offset;
    if (inInCondition) {
      var child = supports.findFirstChildBeforeOffset(this.offset);
      if (child instanceof SupportsCondition) {
        return this.getCompletionsForSupportsCondition(child, result);
      }
      return result;
    }
    return this.getCompletionForTopLevel(result);
  };
  CSSCompletion2.prototype.getCompletionsForExtendsReference = function(extendsRef, existingNode, result) {
    return result;
  };
  CSSCompletion2.prototype.getCompletionForUriLiteralValue = function(uriLiteralNode, result) {
    var uriValue;
    var position;
    var range;
    if (!uriLiteralNode.hasChildren()) {
      uriValue = "";
      position = this.position;
      var emptyURIValuePosition = this.textDocument.positionAt(uriLiteralNode.offset + "url(".length);
      range = Range.create(emptyURIValuePosition, emptyURIValuePosition);
    } else {
      var uriValueNode = uriLiteralNode.getChild(0);
      uriValue = uriValueNode.getText();
      position = this.position;
      range = this.getCompletionRange(uriValueNode);
    }
    this.completionParticipants.forEach(function(participant) {
      if (participant.onCssURILiteralValue) {
        participant.onCssURILiteralValue({
          uriValue,
          position,
          range
        });
      }
    });
    return result;
  };
  CSSCompletion2.prototype.getCompletionForImportPath = function(importPathNode, result) {
    var _this = this;
    this.completionParticipants.forEach(function(participant) {
      if (participant.onCssImportPath) {
        participant.onCssImportPath({
          pathValue: importPathNode.getText(),
          position: _this.position,
          range: _this.getCompletionRange(importPathNode)
        });
      }
    });
    return result;
  };
  CSSCompletion2.prototype.hasCharacterAtPosition = function(offset, char) {
    var text = this.textDocument.getText();
    return offset >= 0 && offset < text.length && text.charAt(offset) === char;
  };
  CSSCompletion2.prototype.doesSupportMarkdown = function() {
    var _a2, _b, _c;
    if (!isDefined(this.supportsMarkdown)) {
      if (!isDefined(this.lsOptions.clientCapabilities)) {
        this.supportsMarkdown = true;
        return this.supportsMarkdown;
      }
      var documentationFormat = (_c = (_b = (_a2 = this.lsOptions.clientCapabilities.textDocument) === null || _a2 === void 0 ? void 0 : _a2.completion) === null || _b === void 0 ? void 0 : _b.completionItem) === null || _c === void 0 ? void 0 : _c.documentationFormat;
      this.supportsMarkdown = Array.isArray(documentationFormat) && documentationFormat.indexOf(MarkupKind.Markdown) !== -1;
    }
    return this.supportsMarkdown;
  };
  return CSSCompletion2;
}();
function isDeprecated(entry) {
  if (entry.status && (entry.status === "nonstandard" || entry.status === "obsolete")) {
    return true;
  }
  return false;
}
var Set = function() {
  function Set2() {
    this.entries = {};
  }
  Set2.prototype.add = function(entry) {
    this.entries[entry] = true;
  };
  Set2.prototype.getEntries = function() {
    return Object.keys(this.entries);
  };
  return Set2;
}();
function moveCursorInsideParenthesis(text) {
  return text.replace(/\(\)$/, "($1)");
}
function collectValues(styleSheet, declaration) {
  var fullPropertyName = declaration.getFullPropertyName();
  var entries = new Set();
  function visitValue(node) {
    if (node instanceof Identifier || node instanceof NumericValue || node instanceof HexColorValue) {
      entries.add(node.getText());
    }
    return true;
  }
  function matchesProperty(decl) {
    var propertyName = decl.getFullPropertyName();
    return fullPropertyName === propertyName;
  }
  function vistNode(node) {
    if (node instanceof Declaration && node !== declaration) {
      if (matchesProperty(node)) {
        var value = node.getValue();
        if (value) {
          value.accept(visitValue);
        }
      }
    }
    return true;
  }
  styleSheet.accept(vistNode);
  return entries;
}
var ColorValueCollector = function() {
  function ColorValueCollector2(entries, currentOffset) {
    this.entries = entries;
    this.currentOffset = currentOffset;
  }
  ColorValueCollector2.prototype.visitNode = function(node) {
    if (node instanceof HexColorValue || node instanceof Function && isColorConstructor(node)) {
      if (this.currentOffset < node.offset || node.end < this.currentOffset) {
        this.entries.add(node.getText());
      }
    }
    return true;
  };
  return ColorValueCollector2;
}();
function getCurrentWord(document, offset) {
  var i = offset - 1;
  var text = document.getText();
  while (i >= 0 && ' 	\n\r":{[()]},*>+'.indexOf(text.charAt(i)) === -1) {
    i--;
  }
  return text.substring(i + 1, offset);
}
function isColorString(s) {
  return s.toLowerCase() in colors || /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(s);
}
var __extends$7 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var Element = function() {
  function Element2() {
    this.parent = null;
    this.children = null;
    this.attributes = null;
  }
  Element2.prototype.findAttribute = function(name) {
    if (this.attributes) {
      for (var _i = 0, _a2 = this.attributes; _i < _a2.length; _i++) {
        var attribute = _a2[_i];
        if (attribute.name === name) {
          return attribute.value;
        }
      }
    }
    return null;
  };
  Element2.prototype.addChild = function(child) {
    if (child instanceof Element2) {
      child.parent = this;
    }
    if (!this.children) {
      this.children = [];
    }
    this.children.push(child);
  };
  Element2.prototype.append = function(text) {
    if (this.attributes) {
      var last = this.attributes[this.attributes.length - 1];
      last.value = last.value + text;
    }
  };
  Element2.prototype.prepend = function(text) {
    if (this.attributes) {
      var first = this.attributes[0];
      first.value = text + first.value;
    }
  };
  Element2.prototype.findRoot = function() {
    var curr = this;
    while (curr.parent && !(curr.parent instanceof RootElement)) {
      curr = curr.parent;
    }
    return curr;
  };
  Element2.prototype.removeChild = function(child) {
    if (this.children) {
      var index = this.children.indexOf(child);
      if (index !== -1) {
        this.children.splice(index, 1);
        return true;
      }
    }
    return false;
  };
  Element2.prototype.addAttr = function(name, value) {
    if (!this.attributes) {
      this.attributes = [];
    }
    for (var _i = 0, _a2 = this.attributes; _i < _a2.length; _i++) {
      var attribute = _a2[_i];
      if (attribute.name === name) {
        attribute.value += " " + value;
        return;
      }
    }
    this.attributes.push({ name, value });
  };
  Element2.prototype.clone = function(cloneChildren) {
    if (cloneChildren === void 0) {
      cloneChildren = true;
    }
    var elem = new Element2();
    if (this.attributes) {
      elem.attributes = [];
      for (var _i = 0, _a2 = this.attributes; _i < _a2.length; _i++) {
        var attribute = _a2[_i];
        elem.addAttr(attribute.name, attribute.value);
      }
    }
    if (cloneChildren && this.children) {
      elem.children = [];
      for (var index = 0; index < this.children.length; index++) {
        elem.addChild(this.children[index].clone());
      }
    }
    return elem;
  };
  Element2.prototype.cloneWithParent = function() {
    var clone = this.clone(false);
    if (this.parent && !(this.parent instanceof RootElement)) {
      var parentClone = this.parent.cloneWithParent();
      parentClone.addChild(clone);
    }
    return clone;
  };
  return Element2;
}();
var RootElement = function(_super) {
  __extends$7(RootElement2, _super);
  function RootElement2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  return RootElement2;
}(Element);
(function(_super) {
  __extends$7(LabelElement, _super);
  function LabelElement(label) {
    var _this = _super.call(this) || this;
    _this.addAttr("name", label);
    return _this;
  }
  return LabelElement;
})(Element);
var quotes;
(function(quotes2) {
  function ensure(value, which) {
    return which + remove(value) + which;
  }
  quotes2.ensure = ensure;
  function remove(value) {
    var match = value.match(/^['"](.*)["']$/);
    if (match) {
      return match[1];
    }
    return value;
  }
  quotes2.remove = remove;
})(quotes || (quotes = {}));
var __awaiter$1 = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator$1 = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f2, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f2)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f2 = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f2 = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
var localize$4 = loadMessageBundle();
var startsWithSchemeRegex = /^\w+:\/\//;
var startsWithData = /^data:/;
var CSSNavigation = function() {
  function CSSNavigation2(fileSystemProvider) {
    this.fileSystemProvider = fileSystemProvider;
  }
  CSSNavigation2.prototype.findDefinition = function(document, position, stylesheet) {
    var symbols = new Symbols(stylesheet);
    var offset = document.offsetAt(position);
    var node = getNodeAtOffset(stylesheet, offset);
    if (!node) {
      return null;
    }
    var symbol = symbols.findSymbolFromNode(node);
    if (!symbol) {
      return null;
    }
    return {
      uri: document.uri,
      range: getRange(symbol.node, document)
    };
  };
  CSSNavigation2.prototype.findReferences = function(document, position, stylesheet) {
    var highlights = this.findDocumentHighlights(document, position, stylesheet);
    return highlights.map(function(h) {
      return {
        uri: document.uri,
        range: h.range
      };
    });
  };
  CSSNavigation2.prototype.findDocumentHighlights = function(document, position, stylesheet) {
    var result = [];
    var offset = document.offsetAt(position);
    var node = getNodeAtOffset(stylesheet, offset);
    if (!node || node.type === NodeType.Stylesheet || node.type === NodeType.Declarations) {
      return result;
    }
    if (node.type === NodeType.Identifier && node.parent && node.parent.type === NodeType.ClassSelector) {
      node = node.parent;
    }
    var symbols = new Symbols(stylesheet);
    var symbol = symbols.findSymbolFromNode(node);
    var name = node.getText();
    stylesheet.accept(function(candidate) {
      if (symbol) {
        if (symbols.matchesSymbol(candidate, symbol)) {
          result.push({
            kind: getHighlightKind(candidate),
            range: getRange(candidate, document)
          });
          return false;
        }
      } else if (node && node.type === candidate.type && candidate.matches(name)) {
        result.push({
          kind: getHighlightKind(candidate),
          range: getRange(candidate, document)
        });
      }
      return true;
    });
    return result;
  };
  CSSNavigation2.prototype.isRawStringDocumentLinkNode = function(node) {
    return node.type === NodeType.Import;
  };
  CSSNavigation2.prototype.findDocumentLinks = function(document, stylesheet, documentContext) {
    var linkData = this.findUnresolvedLinks(document, stylesheet);
    var resolvedLinks = [];
    for (var _i = 0, linkData_1 = linkData; _i < linkData_1.length; _i++) {
      var data = linkData_1[_i];
      var link = data.link;
      var target = link.target;
      if (!target || startsWithData.test(target))
        ;
      else if (startsWithSchemeRegex.test(target)) {
        resolvedLinks.push(link);
      } else {
        var resolved = documentContext.resolveReference(target, document.uri);
        if (resolved) {
          link.target = resolved;
        }
        resolvedLinks.push(link);
      }
    }
    return resolvedLinks;
  };
  CSSNavigation2.prototype.findDocumentLinks2 = function(document, stylesheet, documentContext) {
    return __awaiter$1(this, void 0, void 0, function() {
      var linkData, resolvedLinks, _i, linkData_2, data, link, target, resolvedTarget;
      return __generator$1(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            linkData = this.findUnresolvedLinks(document, stylesheet);
            resolvedLinks = [];
            _i = 0, linkData_2 = linkData;
            _a2.label = 1;
          case 1:
            if (!(_i < linkData_2.length))
              return [3, 6];
            data = linkData_2[_i];
            link = data.link;
            target = link.target;
            if (!(!target || startsWithData.test(target)))
              return [3, 2];
            return [3, 5];
          case 2:
            if (!startsWithSchemeRegex.test(target))
              return [3, 3];
            resolvedLinks.push(link);
            return [3, 5];
          case 3:
            return [4, this.resolveRelativeReference(target, document.uri, documentContext, data.isRawLink)];
          case 4:
            resolvedTarget = _a2.sent();
            if (resolvedTarget !== void 0) {
              link.target = resolvedTarget;
              resolvedLinks.push(link);
            }
            _a2.label = 5;
          case 5:
            _i++;
            return [3, 1];
          case 6:
            return [2, resolvedLinks];
        }
      });
    });
  };
  CSSNavigation2.prototype.findUnresolvedLinks = function(document, stylesheet) {
    var _this = this;
    var result = [];
    var collect = function(uriStringNode) {
      var rawUri = uriStringNode.getText();
      var range = getRange(uriStringNode, document);
      if (range.start.line === range.end.line && range.start.character === range.end.character) {
        return;
      }
      if (startsWith(rawUri, "'") || startsWith(rawUri, '"')) {
        rawUri = rawUri.slice(1, -1);
      }
      var isRawLink = uriStringNode.parent ? _this.isRawStringDocumentLinkNode(uriStringNode.parent) : false;
      result.push({ link: { target: rawUri, range }, isRawLink });
    };
    stylesheet.accept(function(candidate) {
      if (candidate.type === NodeType.URILiteral) {
        var first = candidate.getChild(0);
        if (first) {
          collect(first);
        }
        return false;
      }
      if (candidate.parent && _this.isRawStringDocumentLinkNode(candidate.parent)) {
        var rawText = candidate.getText();
        if (startsWith(rawText, "'") || startsWith(rawText, '"')) {
          collect(candidate);
        }
        return false;
      }
      return true;
    });
    return result;
  };
  CSSNavigation2.prototype.findDocumentSymbols = function(document, stylesheet) {
    var result = [];
    stylesheet.accept(function(node) {
      var entry = {
        name: null,
        kind: SymbolKind.Class,
        location: null
      };
      var locationNode = node;
      if (node instanceof Selector) {
        entry.name = node.getText();
        locationNode = node.findAParent(NodeType.Ruleset, NodeType.ExtendsReference);
        if (locationNode) {
          entry.location = Location.create(document.uri, getRange(locationNode, document));
          result.push(entry);
        }
        return false;
      } else if (node instanceof VariableDeclaration) {
        entry.name = node.getName();
        entry.kind = SymbolKind.Variable;
      } else if (node instanceof MixinDeclaration) {
        entry.name = node.getName();
        entry.kind = SymbolKind.Method;
      } else if (node instanceof FunctionDeclaration) {
        entry.name = node.getName();
        entry.kind = SymbolKind.Function;
      } else if (node instanceof Keyframe) {
        entry.name = localize$4("literal.keyframes", "@keyframes {0}", node.getName());
      } else if (node instanceof FontFace) {
        entry.name = localize$4("literal.fontface", "@font-face");
      } else if (node instanceof Media) {
        var mediaList = node.getChild(0);
        if (mediaList instanceof Medialist) {
          entry.name = "@media " + mediaList.getText();
          entry.kind = SymbolKind.Module;
        }
      }
      if (entry.name) {
        entry.location = Location.create(document.uri, getRange(locationNode, document));
        result.push(entry);
      }
      return true;
    });
    return result;
  };
  CSSNavigation2.prototype.findDocumentColors = function(document, stylesheet) {
    var result = [];
    stylesheet.accept(function(node) {
      var colorInfo = getColorInformation(node, document);
      if (colorInfo) {
        result.push(colorInfo);
      }
      return true;
    });
    return result;
  };
  CSSNavigation2.prototype.getColorPresentations = function(document, stylesheet, color, range) {
    var result = [];
    var red256 = Math.round(color.red * 255), green256 = Math.round(color.green * 255), blue256 = Math.round(color.blue * 255);
    var label;
    if (color.alpha === 1) {
      label = "rgb(" + red256 + ", " + green256 + ", " + blue256 + ")";
    } else {
      label = "rgba(" + red256 + ", " + green256 + ", " + blue256 + ", " + color.alpha + ")";
    }
    result.push({ label, textEdit: TextEdit.replace(range, label) });
    if (color.alpha === 1) {
      label = "#" + toTwoDigitHex(red256) + toTwoDigitHex(green256) + toTwoDigitHex(blue256);
    } else {
      label = "#" + toTwoDigitHex(red256) + toTwoDigitHex(green256) + toTwoDigitHex(blue256) + toTwoDigitHex(Math.round(color.alpha * 255));
    }
    result.push({ label, textEdit: TextEdit.replace(range, label) });
    var hsl = hslFromColor(color);
    if (hsl.a === 1) {
      label = "hsl(" + hsl.h + ", " + Math.round(hsl.s * 100) + "%, " + Math.round(hsl.l * 100) + "%)";
    } else {
      label = "hsla(" + hsl.h + ", " + Math.round(hsl.s * 100) + "%, " + Math.round(hsl.l * 100) + "%, " + hsl.a + ")";
    }
    result.push({ label, textEdit: TextEdit.replace(range, label) });
    return result;
  };
  CSSNavigation2.prototype.doRename = function(document, position, newName, stylesheet) {
    var _a2;
    var highlights = this.findDocumentHighlights(document, position, stylesheet);
    var edits = highlights.map(function(h) {
      return TextEdit.replace(h.range, newName);
    });
    return {
      changes: (_a2 = {}, _a2[document.uri] = edits, _a2)
    };
  };
  CSSNavigation2.prototype.resolveRelativeReference = function(ref, documentUri, documentContext, isRawLink) {
    return __awaiter$1(this, void 0, void 0, function() {
      var moduleName, rootFolderUri, documentFolderUri, modulePath, pathWithinModule;
      return __generator$1(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            if (!(ref[0] === "~" && ref[1] !== "/" && this.fileSystemProvider))
              return [3, 3];
            ref = ref.substring(1);
            if (!startsWith(documentUri, "file://"))
              return [3, 2];
            moduleName = getModuleNameFromPath(ref);
            rootFolderUri = documentContext.resolveReference("/", documentUri);
            documentFolderUri = dirname(documentUri);
            return [4, this.resolvePathToModule(moduleName, documentFolderUri, rootFolderUri)];
          case 1:
            modulePath = _a2.sent();
            if (modulePath) {
              pathWithinModule = ref.substring(moduleName.length + 1);
              return [2, joinPath(modulePath, pathWithinModule)];
            }
            _a2.label = 2;
          case 2:
            return [2, documentContext.resolveReference(ref, documentUri)];
          case 3:
            return [2, documentContext.resolveReference(ref, documentUri)];
        }
      });
    });
  };
  CSSNavigation2.prototype.resolvePathToModule = function(_moduleName, documentFolderUri, rootFolderUri) {
    return __awaiter$1(this, void 0, void 0, function() {
      var packPath;
      return __generator$1(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            packPath = joinPath(documentFolderUri, "node_modules", _moduleName, "package.json");
            return [4, this.fileExists(packPath)];
          case 1:
            if (_a2.sent()) {
              return [2, dirname(packPath)];
            } else if (rootFolderUri && documentFolderUri.startsWith(rootFolderUri) && documentFolderUri.length !== rootFolderUri.length) {
              return [2, this.resolvePathToModule(_moduleName, dirname(documentFolderUri), rootFolderUri)];
            }
            return [2, void 0];
        }
      });
    });
  };
  CSSNavigation2.prototype.fileExists = function(uri) {
    return __awaiter$1(this, void 0, void 0, function() {
      var stat;
      return __generator$1(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            if (!this.fileSystemProvider) {
              return [2, false];
            }
            _a2.label = 1;
          case 1:
            _a2.trys.push([1, 3, , 4]);
            return [4, this.fileSystemProvider.stat(uri)];
          case 2:
            stat = _a2.sent();
            if (stat.type === FileType.Unknown && stat.size === -1) {
              return [2, false];
            }
            return [2, true];
          case 3:
            _a2.sent();
            return [2, false];
          case 4:
            return [2];
        }
      });
    });
  };
  return CSSNavigation2;
}();
function getColorInformation(node, document) {
  var color = getColorValue(node);
  if (color) {
    var range = getRange(node, document);
    return { color, range };
  }
  return null;
}
function getRange(node, document) {
  return Range.create(document.positionAt(node.offset), document.positionAt(node.end));
}
function getHighlightKind(node) {
  if (node.type === NodeType.Selector) {
    return DocumentHighlightKind.Write;
  }
  if (node instanceof Identifier) {
    if (node.parent && node.parent instanceof Property) {
      if (node.isCustomProperty) {
        return DocumentHighlightKind.Write;
      }
    }
  }
  if (node.parent) {
    switch (node.parent.type) {
      case NodeType.FunctionDeclaration:
      case NodeType.MixinDeclaration:
      case NodeType.Keyframe:
      case NodeType.VariableDeclaration:
      case NodeType.FunctionParameter:
        return DocumentHighlightKind.Write;
    }
  }
  return DocumentHighlightKind.Read;
}
function toTwoDigitHex(n) {
  var r = n.toString(16);
  return r.length !== 2 ? "0" + r : r;
}
function getModuleNameFromPath(path) {
  if (path[0] === "@") {
    return path.substring(0, path.indexOf("/", path.indexOf("/") + 1));
  }
  return path.substring(0, path.indexOf("/"));
}
var localize$3 = loadMessageBundle();
var Warning = Level.Warning;
var Error$1 = Level.Error;
var Ignore = Level.Ignore;
var Rule = function() {
  function Rule2(id, message, defaultValue) {
    this.id = id;
    this.message = message;
    this.defaultValue = defaultValue;
  }
  return Rule2;
}();
var Setting = function() {
  function Setting2(id, message, defaultValue) {
    this.id = id;
    this.message = message;
    this.defaultValue = defaultValue;
  }
  return Setting2;
}();
({
  AllVendorPrefixes: new Rule("compatibleVendorPrefixes", localize$3("rule.vendorprefixes.all", "When using a vendor-specific prefix make sure to also include all other vendor-specific properties"), Ignore),
  IncludeStandardPropertyWhenUsingVendorPrefix: new Rule("vendorPrefix", localize$3("rule.standardvendorprefix.all", "When using a vendor-specific prefix also include the standard property"), Warning),
  DuplicateDeclarations: new Rule("duplicateProperties", localize$3("rule.duplicateDeclarations", "Do not use duplicate style definitions"), Ignore),
  EmptyRuleSet: new Rule("emptyRules", localize$3("rule.emptyRuleSets", "Do not use empty rulesets"), Warning),
  ImportStatemement: new Rule("importStatement", localize$3("rule.importDirective", "Import statements do not load in parallel"), Ignore),
  BewareOfBoxModelSize: new Rule("boxModel", localize$3("rule.bewareOfBoxModelSize", "Do not use width or height when using padding or border"), Ignore),
  UniversalSelector: new Rule("universalSelector", localize$3("rule.universalSelector", "The universal selector (*) is known to be slow"), Ignore),
  ZeroWithUnit: new Rule("zeroUnits", localize$3("rule.zeroWidthUnit", "No unit for zero needed"), Ignore),
  RequiredPropertiesForFontFace: new Rule("fontFaceProperties", localize$3("rule.fontFaceProperties", "@font-face rule must define 'src' and 'font-family' properties"), Warning),
  HexColorLength: new Rule("hexColorLength", localize$3("rule.hexColor", "Hex colors must consist of three, four, six or eight hex numbers"), Error$1),
  ArgsInColorFunction: new Rule("argumentsInColorFunction", localize$3("rule.colorFunction", "Invalid number of parameters"), Error$1),
  UnknownProperty: new Rule("unknownProperties", localize$3("rule.unknownProperty", "Unknown property."), Warning),
  UnknownAtRules: new Rule("unknownAtRules", localize$3("rule.unknownAtRules", "Unknown at-rule."), Warning),
  IEStarHack: new Rule("ieHack", localize$3("rule.ieHack", "IE hacks are only necessary when supporting IE7 and older"), Ignore),
  UnknownVendorSpecificProperty: new Rule("unknownVendorSpecificProperties", localize$3("rule.unknownVendorSpecificProperty", "Unknown vendor specific property."), Ignore),
  PropertyIgnoredDueToDisplay: new Rule("propertyIgnoredDueToDisplay", localize$3("rule.propertyIgnoredDueToDisplay", "Property is ignored due to the display."), Warning),
  AvoidImportant: new Rule("important", localize$3("rule.avoidImportant", "Avoid using !important. It is an indication that the specificity of the entire CSS has gotten out of control and needs to be refactored."), Ignore),
  AvoidFloat: new Rule("float", localize$3("rule.avoidFloat", "Avoid using 'float'. Floats lead to fragile CSS that is easy to break if one aspect of the layout changes."), Ignore),
  AvoidIdSelector: new Rule("idSelector", localize$3("rule.avoidIdSelector", "Selectors should not contain IDs because these rules are too tightly coupled with the HTML."), Ignore)
});
({
  ValidProperties: new Setting("validProperties", localize$3("rule.validProperties", "A list of properties that are not validated against the `unknownProperties` rule."), [])
});
var __extends$6 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var _FSL$1 = "/".charCodeAt(0);
var _NWL$1 = "\n".charCodeAt(0);
var _CAR$1 = "\r".charCodeAt(0);
var _LFD$1 = "\f".charCodeAt(0);
var _DLR = "$".charCodeAt(0);
var _HSH = "#".charCodeAt(0);
var _CUL = "{".charCodeAt(0);
var _EQS = "=".charCodeAt(0);
var _BNG = "!".charCodeAt(0);
var _LAN = "<".charCodeAt(0);
var _RAN = ">".charCodeAt(0);
var _DOT$1 = ".".charCodeAt(0);
var customTokenValue$1 = TokenType.CustomToken;
var VariableName = customTokenValue$1++;
var InterpolationFunction = customTokenValue$1++;
customTokenValue$1++;
var EqualsOperator = customTokenValue$1++;
var NotEqualsOperator = customTokenValue$1++;
var GreaterEqualsOperator = customTokenValue$1++;
var SmallerEqualsOperator = customTokenValue$1++;
var Ellipsis$1 = customTokenValue$1++;
customTokenValue$1++;
var SCSSScanner = function(_super) {
  __extends$6(SCSSScanner2, _super);
  function SCSSScanner2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  SCSSScanner2.prototype.scanNext = function(offset) {
    if (this.stream.advanceIfChar(_DLR)) {
      var content = ["$"];
      if (this.ident(content)) {
        return this.finishToken(offset, VariableName, content.join(""));
      } else {
        this.stream.goBackTo(offset);
      }
    }
    if (this.stream.advanceIfChars([_HSH, _CUL])) {
      return this.finishToken(offset, InterpolationFunction);
    }
    if (this.stream.advanceIfChars([_EQS, _EQS])) {
      return this.finishToken(offset, EqualsOperator);
    }
    if (this.stream.advanceIfChars([_BNG, _EQS])) {
      return this.finishToken(offset, NotEqualsOperator);
    }
    if (this.stream.advanceIfChar(_LAN)) {
      if (this.stream.advanceIfChar(_EQS)) {
        return this.finishToken(offset, SmallerEqualsOperator);
      }
      return this.finishToken(offset, TokenType.Delim);
    }
    if (this.stream.advanceIfChar(_RAN)) {
      if (this.stream.advanceIfChar(_EQS)) {
        return this.finishToken(offset, GreaterEqualsOperator);
      }
      return this.finishToken(offset, TokenType.Delim);
    }
    if (this.stream.advanceIfChars([_DOT$1, _DOT$1, _DOT$1])) {
      return this.finishToken(offset, Ellipsis$1);
    }
    return _super.prototype.scanNext.call(this, offset);
  };
  SCSSScanner2.prototype.comment = function() {
    if (_super.prototype.comment.call(this)) {
      return true;
    }
    if (!this.inURL && this.stream.advanceIfChars([_FSL$1, _FSL$1])) {
      this.stream.advanceWhileChar(function(ch) {
        switch (ch) {
          case _NWL$1:
          case _CAR$1:
          case _LFD$1:
            return false;
          default:
            return true;
        }
      });
      return true;
    } else {
      return false;
    }
  };
  return SCSSScanner2;
}(Scanner);
var localize$2 = loadMessageBundle();
var SCSSIssueType = function() {
  function SCSSIssueType2(id, message) {
    this.id = id;
    this.message = message;
  }
  return SCSSIssueType2;
}();
var SCSSParseError = {
  FromExpected: new SCSSIssueType("scss-fromexpected", localize$2("expected.from", "'from' expected")),
  ThroughOrToExpected: new SCSSIssueType("scss-throughexpected", localize$2("expected.through", "'through' or 'to' expected")),
  InExpected: new SCSSIssueType("scss-fromexpected", localize$2("expected.in", "'in' expected"))
};
var __extends$5 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
(function(_super) {
  __extends$5(SCSSParser, _super);
  function SCSSParser() {
    return _super.call(this, new SCSSScanner()) || this;
  }
  SCSSParser.prototype._parseStylesheetStatement = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (this.peek(TokenType.AtKeyword)) {
      return this._parseWarnAndDebug() || this._parseControlStatement() || this._parseMixinDeclaration() || this._parseMixinContent() || this._parseMixinReference() || this._parseFunctionDeclaration() || this._parseForward() || this._parseUse() || this._parseRuleset(isNested) || _super.prototype._parseStylesheetAtStatement.call(this, isNested);
    }
    return this._parseRuleset(true) || this._parseVariableDeclaration();
  };
  SCSSParser.prototype._parseImport = function() {
    if (!this.peekKeyword("@import")) {
      return null;
    }
    var node = this.create(Import);
    this.consumeToken();
    if (!node.addChild(this._parseURILiteral()) && !node.addChild(this._parseStringLiteral())) {
      return this.finish(node, ParseError.URIOrStringExpected);
    }
    while (this.accept(TokenType.Comma)) {
      if (!node.addChild(this._parseURILiteral()) && !node.addChild(this._parseStringLiteral())) {
        return this.finish(node, ParseError.URIOrStringExpected);
      }
    }
    if (!this.peek(TokenType.SemiColon) && !this.peek(TokenType.EOF)) {
      node.setMedialist(this._parseMediaQueryList());
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseVariableDeclaration = function(panic) {
    if (panic === void 0) {
      panic = [];
    }
    if (!this.peek(VariableName)) {
      return null;
    }
    var node = this.create(VariableDeclaration);
    if (!node.setVariable(this._parseVariable())) {
      return null;
    }
    if (!this.accept(TokenType.Colon)) {
      return this.finish(node, ParseError.ColonExpected);
    }
    if (this.prevToken) {
      node.colonPosition = this.prevToken.offset;
    }
    if (!node.setValue(this._parseExpr())) {
      return this.finish(node, ParseError.VariableValueExpected, [], panic);
    }
    while (this.peek(TokenType.Exclamation)) {
      if (node.addChild(this._tryParsePrio()))
        ;
      else {
        this.consumeToken();
        if (!this.peekRegExp(TokenType.Ident, /^(default|global)$/)) {
          return this.finish(node, ParseError.UnknownKeyword);
        }
        this.consumeToken();
      }
    }
    if (this.peek(TokenType.SemiColon)) {
      node.semicolonPosition = this.token.offset;
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseMediaContentStart = function() {
    return this._parseInterpolation();
  };
  SCSSParser.prototype._parseMediaFeatureName = function() {
    return this._parseModuleMember() || this._parseFunction() || this._parseIdent() || this._parseVariable();
  };
  SCSSParser.prototype._parseKeyframeSelector = function() {
    return this._tryParseKeyframeSelector() || this._parseControlStatement(this._parseKeyframeSelector.bind(this)) || this._parseVariableDeclaration() || this._parseMixinContent();
  };
  SCSSParser.prototype._parseVariable = function() {
    if (!this.peek(VariableName)) {
      return null;
    }
    var node = this.create(Variable);
    this.consumeToken();
    return node;
  };
  SCSSParser.prototype._parseModuleMember = function() {
    var pos = this.mark();
    var node = this.create(Module);
    if (!node.setIdentifier(this._parseIdent([ReferenceType.Module]))) {
      return null;
    }
    if (this.hasWhitespace() || !this.acceptDelim(".") || this.hasWhitespace()) {
      this.restoreAtMark(pos);
      return null;
    }
    if (!node.addChild(this._parseVariable() || this._parseFunction())) {
      return this.finish(node, ParseError.IdentifierOrVariableExpected);
    }
    return node;
  };
  SCSSParser.prototype._parseIdent = function(referenceTypes) {
    var _this = this;
    if (!this.peek(TokenType.Ident) && !this.peek(InterpolationFunction) && !this.peekDelim("-")) {
      return null;
    }
    var node = this.create(Identifier);
    node.referenceTypes = referenceTypes;
    node.isCustomProperty = this.peekRegExp(TokenType.Ident, /^--/);
    var hasContent = false;
    var indentInterpolation = function() {
      var pos = _this.mark();
      if (_this.acceptDelim("-")) {
        if (!_this.hasWhitespace()) {
          _this.acceptDelim("-");
        }
        if (_this.hasWhitespace()) {
          _this.restoreAtMark(pos);
          return null;
        }
      }
      return _this._parseInterpolation();
    };
    while (this.accept(TokenType.Ident) || node.addChild(indentInterpolation()) || hasContent && this.acceptRegexp(/^[\w-]/)) {
      hasContent = true;
      if (this.hasWhitespace()) {
        break;
      }
    }
    return hasContent ? this.finish(node) : null;
  };
  SCSSParser.prototype._parseTermExpression = function() {
    return this._parseModuleMember() || this._parseVariable() || this._parseSelectorCombinator() || _super.prototype._parseTermExpression.call(this);
  };
  SCSSParser.prototype._parseInterpolation = function() {
    if (this.peek(InterpolationFunction)) {
      var node = this.create(Interpolation);
      this.consumeToken();
      if (!node.addChild(this._parseExpr()) && !this._parseSelectorCombinator()) {
        if (this.accept(TokenType.CurlyR)) {
          return this.finish(node);
        }
        return this.finish(node, ParseError.ExpressionExpected);
      }
      if (!this.accept(TokenType.CurlyR)) {
        return this.finish(node, ParseError.RightCurlyExpected);
      }
      return this.finish(node);
    }
    return null;
  };
  SCSSParser.prototype._parseOperator = function() {
    if (this.peek(EqualsOperator) || this.peek(NotEqualsOperator) || this.peek(GreaterEqualsOperator) || this.peek(SmallerEqualsOperator) || this.peekDelim(">") || this.peekDelim("<") || this.peekIdent("and") || this.peekIdent("or") || this.peekDelim("%")) {
      var node = this.createNode(NodeType.Operator);
      this.consumeToken();
      return this.finish(node);
    }
    return _super.prototype._parseOperator.call(this);
  };
  SCSSParser.prototype._parseUnaryOperator = function() {
    if (this.peekIdent("not")) {
      var node = this.create(Node);
      this.consumeToken();
      return this.finish(node);
    }
    return _super.prototype._parseUnaryOperator.call(this);
  };
  SCSSParser.prototype._parseRuleSetDeclaration = function() {
    if (this.peek(TokenType.AtKeyword)) {
      return this._parseKeyframe() || this._parseImport() || this._parseMedia(true) || this._parseFontFace() || this._parseWarnAndDebug() || this._parseControlStatement() || this._parseFunctionDeclaration() || this._parseExtends() || this._parseMixinReference() || this._parseMixinContent() || this._parseMixinDeclaration() || this._parseRuleset(true) || this._parseSupports(true) || _super.prototype._parseRuleSetDeclarationAtStatement.call(this);
    }
    return this._parseVariableDeclaration() || this._tryParseRuleset(true) || _super.prototype._parseRuleSetDeclaration.call(this);
  };
  SCSSParser.prototype._parseDeclaration = function(stopTokens) {
    var custonProperty = this._tryParseCustomPropertyDeclaration(stopTokens);
    if (custonProperty) {
      return custonProperty;
    }
    var node = this.create(Declaration);
    if (!node.setProperty(this._parseProperty())) {
      return null;
    }
    if (!this.accept(TokenType.Colon)) {
      return this.finish(node, ParseError.ColonExpected, [TokenType.Colon], stopTokens || [TokenType.SemiColon]);
    }
    if (this.prevToken) {
      node.colonPosition = this.prevToken.offset;
    }
    var hasContent = false;
    if (node.setValue(this._parseExpr())) {
      hasContent = true;
      node.addChild(this._parsePrio());
    }
    if (this.peek(TokenType.CurlyL)) {
      node.setNestedProperties(this._parseNestedProperties());
    } else {
      if (!hasContent) {
        return this.finish(node, ParseError.PropertyValueExpected);
      }
    }
    if (this.peek(TokenType.SemiColon)) {
      node.semicolonPosition = this.token.offset;
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseNestedProperties = function() {
    var node = this.create(NestedProperties);
    return this._parseBody(node, this._parseDeclaration.bind(this));
  };
  SCSSParser.prototype._parseExtends = function() {
    if (this.peekKeyword("@extend")) {
      var node = this.create(ExtendsReference);
      this.consumeToken();
      if (!node.getSelectors().addChild(this._parseSimpleSelector())) {
        return this.finish(node, ParseError.SelectorExpected);
      }
      while (this.accept(TokenType.Comma)) {
        node.getSelectors().addChild(this._parseSimpleSelector());
      }
      if (this.accept(TokenType.Exclamation)) {
        if (!this.acceptIdent("optional")) {
          return this.finish(node, ParseError.UnknownKeyword);
        }
      }
      return this.finish(node);
    }
    return null;
  };
  SCSSParser.prototype._parseSimpleSelectorBody = function() {
    return this._parseSelectorCombinator() || this._parseSelectorPlaceholder() || _super.prototype._parseSimpleSelectorBody.call(this);
  };
  SCSSParser.prototype._parseSelectorCombinator = function() {
    if (this.peekDelim("&")) {
      var node = this.createNode(NodeType.SelectorCombinator);
      this.consumeToken();
      while (!this.hasWhitespace() && (this.acceptDelim("-") || this.accept(TokenType.Num) || this.accept(TokenType.Dimension) || node.addChild(this._parseIdent()) || this.acceptDelim("&"))) {
      }
      return this.finish(node);
    }
    return null;
  };
  SCSSParser.prototype._parseSelectorPlaceholder = function() {
    if (this.peekDelim("%")) {
      var node = this.createNode(NodeType.SelectorPlaceholder);
      this.consumeToken();
      this._parseIdent();
      return this.finish(node);
    } else if (this.peekKeyword("@at-root")) {
      var node = this.createNode(NodeType.SelectorPlaceholder);
      this.consumeToken();
      return this.finish(node);
    }
    return null;
  };
  SCSSParser.prototype._parseElementName = function() {
    var pos = this.mark();
    var node = _super.prototype._parseElementName.call(this);
    if (node && !this.hasWhitespace() && this.peek(TokenType.ParenthesisL)) {
      this.restoreAtMark(pos);
      return null;
    }
    return node;
  };
  SCSSParser.prototype._tryParsePseudoIdentifier = function() {
    return this._parseInterpolation() || _super.prototype._tryParsePseudoIdentifier.call(this);
  };
  SCSSParser.prototype._parseWarnAndDebug = function() {
    if (!this.peekKeyword("@debug") && !this.peekKeyword("@warn") && !this.peekKeyword("@error")) {
      return null;
    }
    var node = this.createNode(NodeType.Debug);
    this.consumeToken();
    node.addChild(this._parseExpr());
    return this.finish(node);
  };
  SCSSParser.prototype._parseControlStatement = function(parseStatement) {
    if (parseStatement === void 0) {
      parseStatement = this._parseRuleSetDeclaration.bind(this);
    }
    if (!this.peek(TokenType.AtKeyword)) {
      return null;
    }
    return this._parseIfStatement(parseStatement) || this._parseForStatement(parseStatement) || this._parseEachStatement(parseStatement) || this._parseWhileStatement(parseStatement);
  };
  SCSSParser.prototype._parseIfStatement = function(parseStatement) {
    if (!this.peekKeyword("@if")) {
      return null;
    }
    return this._internalParseIfStatement(parseStatement);
  };
  SCSSParser.prototype._internalParseIfStatement = function(parseStatement) {
    var node = this.create(IfStatement);
    this.consumeToken();
    if (!node.setExpression(this._parseExpr(true))) {
      return this.finish(node, ParseError.ExpressionExpected);
    }
    this._parseBody(node, parseStatement);
    if (this.acceptKeyword("@else")) {
      if (this.peekIdent("if")) {
        node.setElseClause(this._internalParseIfStatement(parseStatement));
      } else if (this.peek(TokenType.CurlyL)) {
        var elseNode = this.create(ElseStatement);
        this._parseBody(elseNode, parseStatement);
        node.setElseClause(elseNode);
      }
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseForStatement = function(parseStatement) {
    if (!this.peekKeyword("@for")) {
      return null;
    }
    var node = this.create(ForStatement);
    this.consumeToken();
    if (!node.setVariable(this._parseVariable())) {
      return this.finish(node, ParseError.VariableNameExpected, [TokenType.CurlyR]);
    }
    if (!this.acceptIdent("from")) {
      return this.finish(node, SCSSParseError.FromExpected, [TokenType.CurlyR]);
    }
    if (!node.addChild(this._parseBinaryExpr())) {
      return this.finish(node, ParseError.ExpressionExpected, [TokenType.CurlyR]);
    }
    if (!this.acceptIdent("to") && !this.acceptIdent("through")) {
      return this.finish(node, SCSSParseError.ThroughOrToExpected, [TokenType.CurlyR]);
    }
    if (!node.addChild(this._parseBinaryExpr())) {
      return this.finish(node, ParseError.ExpressionExpected, [TokenType.CurlyR]);
    }
    return this._parseBody(node, parseStatement);
  };
  SCSSParser.prototype._parseEachStatement = function(parseStatement) {
    if (!this.peekKeyword("@each")) {
      return null;
    }
    var node = this.create(EachStatement);
    this.consumeToken();
    var variables = node.getVariables();
    if (!variables.addChild(this._parseVariable())) {
      return this.finish(node, ParseError.VariableNameExpected, [TokenType.CurlyR]);
    }
    while (this.accept(TokenType.Comma)) {
      if (!variables.addChild(this._parseVariable())) {
        return this.finish(node, ParseError.VariableNameExpected, [TokenType.CurlyR]);
      }
    }
    this.finish(variables);
    if (!this.acceptIdent("in")) {
      return this.finish(node, SCSSParseError.InExpected, [TokenType.CurlyR]);
    }
    if (!node.addChild(this._parseExpr())) {
      return this.finish(node, ParseError.ExpressionExpected, [TokenType.CurlyR]);
    }
    return this._parseBody(node, parseStatement);
  };
  SCSSParser.prototype._parseWhileStatement = function(parseStatement) {
    if (!this.peekKeyword("@while")) {
      return null;
    }
    var node = this.create(WhileStatement);
    this.consumeToken();
    if (!node.addChild(this._parseBinaryExpr())) {
      return this.finish(node, ParseError.ExpressionExpected, [TokenType.CurlyR]);
    }
    return this._parseBody(node, parseStatement);
  };
  SCSSParser.prototype._parseFunctionBodyDeclaration = function() {
    return this._parseVariableDeclaration() || this._parseReturnStatement() || this._parseWarnAndDebug() || this._parseControlStatement(this._parseFunctionBodyDeclaration.bind(this));
  };
  SCSSParser.prototype._parseFunctionDeclaration = function() {
    if (!this.peekKeyword("@function")) {
      return null;
    }
    var node = this.create(FunctionDeclaration);
    this.consumeToken();
    if (!node.setIdentifier(this._parseIdent([ReferenceType.Function]))) {
      return this.finish(node, ParseError.IdentifierExpected, [TokenType.CurlyR]);
    }
    if (!this.accept(TokenType.ParenthesisL)) {
      return this.finish(node, ParseError.LeftParenthesisExpected, [TokenType.CurlyR]);
    }
    if (node.getParameters().addChild(this._parseParameterDeclaration())) {
      while (this.accept(TokenType.Comma)) {
        if (this.peek(TokenType.ParenthesisR)) {
          break;
        }
        if (!node.getParameters().addChild(this._parseParameterDeclaration())) {
          return this.finish(node, ParseError.VariableNameExpected);
        }
      }
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected, [TokenType.CurlyR]);
    }
    return this._parseBody(node, this._parseFunctionBodyDeclaration.bind(this));
  };
  SCSSParser.prototype._parseReturnStatement = function() {
    if (!this.peekKeyword("@return")) {
      return null;
    }
    var node = this.createNode(NodeType.ReturnStatement);
    this.consumeToken();
    if (!node.addChild(this._parseExpr())) {
      return this.finish(node, ParseError.ExpressionExpected);
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseMixinDeclaration = function() {
    if (!this.peekKeyword("@mixin")) {
      return null;
    }
    var node = this.create(MixinDeclaration);
    this.consumeToken();
    if (!node.setIdentifier(this._parseIdent([ReferenceType.Mixin]))) {
      return this.finish(node, ParseError.IdentifierExpected, [TokenType.CurlyR]);
    }
    if (this.accept(TokenType.ParenthesisL)) {
      if (node.getParameters().addChild(this._parseParameterDeclaration())) {
        while (this.accept(TokenType.Comma)) {
          if (this.peek(TokenType.ParenthesisR)) {
            break;
          }
          if (!node.getParameters().addChild(this._parseParameterDeclaration())) {
            return this.finish(node, ParseError.VariableNameExpected);
          }
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected, [TokenType.CurlyR]);
      }
    }
    return this._parseBody(node, this._parseRuleSetDeclaration.bind(this));
  };
  SCSSParser.prototype._parseParameterDeclaration = function() {
    var node = this.create(FunctionParameter);
    if (!node.setIdentifier(this._parseVariable())) {
      return null;
    }
    if (this.accept(Ellipsis$1))
      ;
    if (this.accept(TokenType.Colon)) {
      if (!node.setDefaultValue(this._parseExpr(true))) {
        return this.finish(node, ParseError.VariableValueExpected, [], [TokenType.Comma, TokenType.ParenthesisR]);
      }
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseMixinContent = function() {
    if (!this.peekKeyword("@content")) {
      return null;
    }
    var node = this.create(MixinContentReference);
    this.consumeToken();
    if (this.accept(TokenType.ParenthesisL)) {
      if (node.getArguments().addChild(this._parseFunctionArgument())) {
        while (this.accept(TokenType.Comma)) {
          if (this.peek(TokenType.ParenthesisR)) {
            break;
          }
          if (!node.getArguments().addChild(this._parseFunctionArgument())) {
            return this.finish(node, ParseError.ExpressionExpected);
          }
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected);
      }
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseMixinReference = function() {
    if (!this.peekKeyword("@include")) {
      return null;
    }
    var node = this.create(MixinReference);
    this.consumeToken();
    var firstIdent = this._parseIdent([ReferenceType.Mixin]);
    if (!node.setIdentifier(firstIdent)) {
      return this.finish(node, ParseError.IdentifierExpected, [TokenType.CurlyR]);
    }
    if (!this.hasWhitespace() && this.acceptDelim(".") && !this.hasWhitespace()) {
      var secondIdent = this._parseIdent([ReferenceType.Mixin]);
      if (!secondIdent) {
        return this.finish(node, ParseError.IdentifierExpected, [TokenType.CurlyR]);
      }
      var moduleToken = this.create(Module);
      firstIdent.referenceTypes = [ReferenceType.Module];
      moduleToken.setIdentifier(firstIdent);
      node.setIdentifier(secondIdent);
      node.addChild(moduleToken);
    }
    if (this.accept(TokenType.ParenthesisL)) {
      if (node.getArguments().addChild(this._parseFunctionArgument())) {
        while (this.accept(TokenType.Comma)) {
          if (this.peek(TokenType.ParenthesisR)) {
            break;
          }
          if (!node.getArguments().addChild(this._parseFunctionArgument())) {
            return this.finish(node, ParseError.ExpressionExpected);
          }
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected);
      }
    }
    if (this.peekIdent("using") || this.peek(TokenType.CurlyL)) {
      node.setContent(this._parseMixinContentDeclaration());
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseMixinContentDeclaration = function() {
    var node = this.create(MixinContentDeclaration);
    if (this.acceptIdent("using")) {
      if (!this.accept(TokenType.ParenthesisL)) {
        return this.finish(node, ParseError.LeftParenthesisExpected, [TokenType.CurlyL]);
      }
      if (node.getParameters().addChild(this._parseParameterDeclaration())) {
        while (this.accept(TokenType.Comma)) {
          if (this.peek(TokenType.ParenthesisR)) {
            break;
          }
          if (!node.getParameters().addChild(this._parseParameterDeclaration())) {
            return this.finish(node, ParseError.VariableNameExpected);
          }
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected, [TokenType.CurlyL]);
      }
    }
    if (this.peek(TokenType.CurlyL)) {
      this._parseBody(node, this._parseMixinReferenceBodyStatement.bind(this));
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseMixinReferenceBodyStatement = function() {
    return this._tryParseKeyframeSelector() || this._parseRuleSetDeclaration();
  };
  SCSSParser.prototype._parseFunctionArgument = function() {
    var node = this.create(FunctionArgument);
    var pos = this.mark();
    var argument = this._parseVariable();
    if (argument) {
      if (!this.accept(TokenType.Colon)) {
        if (this.accept(Ellipsis$1)) {
          node.setValue(argument);
          return this.finish(node);
        } else {
          this.restoreAtMark(pos);
        }
      } else {
        node.setIdentifier(argument);
      }
    }
    if (node.setValue(this._parseExpr(true))) {
      this.accept(Ellipsis$1);
      node.addChild(this._parsePrio());
      return this.finish(node);
    } else if (node.setValue(this._tryParsePrio())) {
      return this.finish(node);
    }
    return null;
  };
  SCSSParser.prototype._parseURLArgument = function() {
    var pos = this.mark();
    var node = _super.prototype._parseURLArgument.call(this);
    if (!node || !this.peek(TokenType.ParenthesisR)) {
      this.restoreAtMark(pos);
      var node_1 = this.create(Node);
      node_1.addChild(this._parseBinaryExpr());
      return this.finish(node_1);
    }
    return node;
  };
  SCSSParser.prototype._parseOperation = function() {
    if (!this.peek(TokenType.ParenthesisL)) {
      return null;
    }
    var node = this.create(Node);
    this.consumeToken();
    while (node.addChild(this._parseListElement())) {
      this.accept(TokenType.Comma);
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseListElement = function() {
    var node = this.create(ListEntry);
    var child = this._parseBinaryExpr();
    if (!child) {
      return null;
    }
    if (this.accept(TokenType.Colon)) {
      node.setKey(child);
      if (!node.setValue(this._parseBinaryExpr())) {
        return this.finish(node, ParseError.ExpressionExpected);
      }
    } else {
      node.setValue(child);
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseUse = function() {
    if (!this.peekKeyword("@use")) {
      return null;
    }
    var node = this.create(Use);
    this.consumeToken();
    if (!node.addChild(this._parseStringLiteral())) {
      return this.finish(node, ParseError.StringLiteralExpected);
    }
    if (!this.peek(TokenType.SemiColon) && !this.peek(TokenType.EOF)) {
      if (!this.peekRegExp(TokenType.Ident, /as|with/)) {
        return this.finish(node, ParseError.UnknownKeyword);
      }
      if (this.acceptIdent("as") && (!node.setIdentifier(this._parseIdent([ReferenceType.Module])) && !this.acceptDelim("*"))) {
        return this.finish(node, ParseError.IdentifierOrWildcardExpected);
      }
      if (this.acceptIdent("with")) {
        if (!this.accept(TokenType.ParenthesisL)) {
          return this.finish(node, ParseError.LeftParenthesisExpected, [TokenType.ParenthesisR]);
        }
        if (!node.getParameters().addChild(this._parseModuleConfigDeclaration())) {
          return this.finish(node, ParseError.VariableNameExpected);
        }
        while (this.accept(TokenType.Comma)) {
          if (this.peek(TokenType.ParenthesisR)) {
            break;
          }
          if (!node.getParameters().addChild(this._parseModuleConfigDeclaration())) {
            return this.finish(node, ParseError.VariableNameExpected);
          }
        }
        if (!this.accept(TokenType.ParenthesisR)) {
          return this.finish(node, ParseError.RightParenthesisExpected);
        }
      }
    }
    if (!this.accept(TokenType.SemiColon) && !this.accept(TokenType.EOF)) {
      return this.finish(node, ParseError.SemiColonExpected);
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseModuleConfigDeclaration = function() {
    var node = this.create(ModuleConfiguration);
    if (!node.setIdentifier(this._parseVariable())) {
      return null;
    }
    if (!this.accept(TokenType.Colon) || !node.setValue(this._parseExpr(true))) {
      return this.finish(node, ParseError.VariableValueExpected, [], [TokenType.Comma, TokenType.ParenthesisR]);
    }
    if (this.accept(TokenType.Exclamation)) {
      if (this.hasWhitespace() || !this.acceptIdent("default")) {
        return this.finish(node, ParseError.UnknownKeyword);
      }
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseForward = function() {
    if (!this.peekKeyword("@forward")) {
      return null;
    }
    var node = this.create(Forward);
    this.consumeToken();
    if (!node.addChild(this._parseStringLiteral())) {
      return this.finish(node, ParseError.StringLiteralExpected);
    }
    if (this.acceptIdent("with")) {
      if (!this.accept(TokenType.ParenthesisL)) {
        return this.finish(node, ParseError.LeftParenthesisExpected, [TokenType.ParenthesisR]);
      }
      if (!node.getParameters().addChild(this._parseModuleConfigDeclaration())) {
        return this.finish(node, ParseError.VariableNameExpected);
      }
      while (this.accept(TokenType.Comma)) {
        if (this.peek(TokenType.ParenthesisR)) {
          break;
        }
        if (!node.getParameters().addChild(this._parseModuleConfigDeclaration())) {
          return this.finish(node, ParseError.VariableNameExpected);
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected);
      }
    }
    if (!this.peek(TokenType.SemiColon) && !this.peek(TokenType.EOF)) {
      if (!this.peekRegExp(TokenType.Ident, /as|hide|show/)) {
        return this.finish(node, ParseError.UnknownKeyword);
      }
      if (this.acceptIdent("as")) {
        var identifier = this._parseIdent([ReferenceType.Forward]);
        if (!node.setIdentifier(identifier)) {
          return this.finish(node, ParseError.IdentifierExpected);
        }
        if (this.hasWhitespace() || !this.acceptDelim("*")) {
          return this.finish(node, ParseError.WildcardExpected);
        }
      }
      if (this.peekIdent("hide") || this.peekIdent("show")) {
        if (!node.addChild(this._parseForwardVisibility())) {
          return this.finish(node, ParseError.IdentifierOrVariableExpected);
        }
      }
    }
    if (!this.accept(TokenType.SemiColon) && !this.accept(TokenType.EOF)) {
      return this.finish(node, ParseError.SemiColonExpected);
    }
    return this.finish(node);
  };
  SCSSParser.prototype._parseForwardVisibility = function() {
    var node = this.create(ForwardVisibility);
    node.setIdentifier(this._parseIdent());
    while (node.addChild(this._parseVariable() || this._parseIdent())) {
      this.accept(TokenType.Comma);
    }
    return node.getChildren().length > 1 ? node : null;
  };
  SCSSParser.prototype._parseSupportsCondition = function() {
    return this._parseInterpolation() || _super.prototype._parseSupportsCondition.call(this);
  };
  return SCSSParser;
})(Parser);
var __extends$4 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var localize$1 = loadMessageBundle();
(function(_super) {
  __extends$4(SCSSCompletion, _super);
  function SCSSCompletion(lsServiceOptions, cssDataManager) {
    var _this = _super.call(this, "$", lsServiceOptions, cssDataManager) || this;
    addReferencesToDocumentation(SCSSCompletion.scssModuleLoaders);
    addReferencesToDocumentation(SCSSCompletion.scssModuleBuiltIns);
    return _this;
  }
  SCSSCompletion.prototype.isImportPathParent = function(type) {
    return type === NodeType.Forward || type === NodeType.Use || _super.prototype.isImportPathParent.call(this, type);
  };
  SCSSCompletion.prototype.getCompletionForImportPath = function(importPathNode, result) {
    var parentType = importPathNode.getParent().type;
    if (parentType === NodeType.Forward || parentType === NodeType.Use) {
      for (var _i = 0, _a2 = SCSSCompletion.scssModuleBuiltIns; _i < _a2.length; _i++) {
        var p = _a2[_i];
        var item = {
          label: p.label,
          documentation: p.documentation,
          textEdit: TextEdit.replace(this.getCompletionRange(importPathNode), "'" + p.label + "'"),
          kind: CompletionItemKind.Module
        };
        result.items.push(item);
      }
    }
    return _super.prototype.getCompletionForImportPath.call(this, importPathNode, result);
  };
  SCSSCompletion.prototype.createReplaceFunction = function() {
    var tabStopCounter = 1;
    return function(_match, p1) {
      return "\\" + p1 + ": ${" + tabStopCounter++ + ":" + (SCSSCompletion.variableDefaults[p1] || "") + "}";
    };
  };
  SCSSCompletion.prototype.createFunctionProposals = function(proposals, existingNode, sortToEnd, result) {
    for (var _i = 0, proposals_1 = proposals; _i < proposals_1.length; _i++) {
      var p = proposals_1[_i];
      var insertText = p.func.replace(/\[?(\$\w+)\]?/g, this.createReplaceFunction());
      var label = p.func.substr(0, p.func.indexOf("("));
      var item = {
        label,
        detail: p.func,
        documentation: p.desc,
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), insertText),
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Function
      };
      if (sortToEnd) {
        item.sortText = "z";
      }
      result.items.push(item);
    }
    return result;
  };
  SCSSCompletion.prototype.getCompletionsForSelector = function(ruleSet, isNested, result) {
    this.createFunctionProposals(SCSSCompletion.selectorFuncs, null, true, result);
    return _super.prototype.getCompletionsForSelector.call(this, ruleSet, isNested, result);
  };
  SCSSCompletion.prototype.getTermProposals = function(entry, existingNode, result) {
    var functions = SCSSCompletion.builtInFuncs;
    if (entry) {
      functions = functions.filter(function(f2) {
        return !f2.type || !entry.restrictions || entry.restrictions.indexOf(f2.type) !== -1;
      });
    }
    this.createFunctionProposals(functions, existingNode, true, result);
    return _super.prototype.getTermProposals.call(this, entry, existingNode, result);
  };
  SCSSCompletion.prototype.getColorProposals = function(entry, existingNode, result) {
    this.createFunctionProposals(SCSSCompletion.colorProposals, existingNode, false, result);
    return _super.prototype.getColorProposals.call(this, entry, existingNode, result);
  };
  SCSSCompletion.prototype.getCompletionsForDeclarationProperty = function(declaration, result) {
    this.getCompletionForAtDirectives(result);
    this.getCompletionsForSelector(null, true, result);
    return _super.prototype.getCompletionsForDeclarationProperty.call(this, declaration, result);
  };
  SCSSCompletion.prototype.getCompletionsForExtendsReference = function(_extendsRef, existingNode, result) {
    var symbols = this.getSymbolContext().findSymbolsAtOffset(this.offset, ReferenceType.Rule);
    for (var _i = 0, symbols_1 = symbols; _i < symbols_1.length; _i++) {
      var symbol = symbols_1[_i];
      var suggest = {
        label: symbol.name,
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), symbol.name),
        kind: CompletionItemKind.Function
      };
      result.items.push(suggest);
    }
    return result;
  };
  SCSSCompletion.prototype.getCompletionForAtDirectives = function(result) {
    var _a2;
    (_a2 = result.items).push.apply(_a2, SCSSCompletion.scssAtDirectives);
    return result;
  };
  SCSSCompletion.prototype.getCompletionForTopLevel = function(result) {
    this.getCompletionForAtDirectives(result);
    this.getCompletionForModuleLoaders(result);
    _super.prototype.getCompletionForTopLevel.call(this, result);
    return result;
  };
  SCSSCompletion.prototype.getCompletionForModuleLoaders = function(result) {
    var _a2;
    (_a2 = result.items).push.apply(_a2, SCSSCompletion.scssModuleLoaders);
    return result;
  };
  SCSSCompletion.variableDefaults = {
    "$red": "1",
    "$green": "2",
    "$blue": "3",
    "$alpha": "1.0",
    "$color": "#000000",
    "$weight": "0.5",
    "$hue": "0",
    "$saturation": "0%",
    "$lightness": "0%",
    "$degrees": "0",
    "$amount": "0",
    "$string": '""',
    "$substring": '"s"',
    "$number": "0",
    "$limit": "1"
  };
  SCSSCompletion.colorProposals = [
    { func: "red($color)", desc: localize$1("scss.builtin.red", "Gets the red component of a color.") },
    { func: "green($color)", desc: localize$1("scss.builtin.green", "Gets the green component of a color.") },
    { func: "blue($color)", desc: localize$1("scss.builtin.blue", "Gets the blue component of a color.") },
    { func: "mix($color, $color, [$weight])", desc: localize$1("scss.builtin.mix", "Mixes two colors together.") },
    { func: "hue($color)", desc: localize$1("scss.builtin.hue", "Gets the hue component of a color.") },
    { func: "saturation($color)", desc: localize$1("scss.builtin.saturation", "Gets the saturation component of a color.") },
    { func: "lightness($color)", desc: localize$1("scss.builtin.lightness", "Gets the lightness component of a color.") },
    { func: "adjust-hue($color, $degrees)", desc: localize$1("scss.builtin.adjust-hue", "Changes the hue of a color.") },
    { func: "lighten($color, $amount)", desc: localize$1("scss.builtin.lighten", "Makes a color lighter.") },
    { func: "darken($color, $amount)", desc: localize$1("scss.builtin.darken", "Makes a color darker.") },
    { func: "saturate($color, $amount)", desc: localize$1("scss.builtin.saturate", "Makes a color more saturated.") },
    { func: "desaturate($color, $amount)", desc: localize$1("scss.builtin.desaturate", "Makes a color less saturated.") },
    { func: "grayscale($color)", desc: localize$1("scss.builtin.grayscale", "Converts a color to grayscale.") },
    { func: "complement($color)", desc: localize$1("scss.builtin.complement", "Returns the complement of a color.") },
    { func: "invert($color)", desc: localize$1("scss.builtin.invert", "Returns the inverse of a color.") },
    { func: "alpha($color)", desc: localize$1("scss.builtin.alpha", "Gets the opacity component of a color.") },
    { func: "opacity($color)", desc: "Gets the alpha component (opacity) of a color." },
    { func: "rgba($color, $alpha)", desc: localize$1("scss.builtin.rgba", "Changes the alpha component for a color.") },
    { func: "opacify($color, $amount)", desc: localize$1("scss.builtin.opacify", "Makes a color more opaque.") },
    { func: "fade-in($color, $amount)", desc: localize$1("scss.builtin.fade-in", "Makes a color more opaque.") },
    { func: "transparentize($color, $amount)", desc: localize$1("scss.builtin.transparentize", "Makes a color more transparent.") },
    { func: "fade-out($color, $amount)", desc: localize$1("scss.builtin.fade-out", "Makes a color more transparent.") },
    { func: "adjust-color($color, [$red], [$green], [$blue], [$hue], [$saturation], [$lightness], [$alpha])", desc: localize$1("scss.builtin.adjust-color", "Increases or decreases one or more components of a color.") },
    { func: "scale-color($color, [$red], [$green], [$blue], [$saturation], [$lightness], [$alpha])", desc: localize$1("scss.builtin.scale-color", "Fluidly scales one or more properties of a color.") },
    { func: "change-color($color, [$red], [$green], [$blue], [$hue], [$saturation], [$lightness], [$alpha])", desc: localize$1("scss.builtin.change-color", "Changes one or more properties of a color.") },
    { func: "ie-hex-str($color)", desc: localize$1("scss.builtin.ie-hex-str", "Converts a color into the format understood by IE filters.") }
  ];
  SCSSCompletion.selectorFuncs = [
    { func: "selector-nest($selectors\u2026)", desc: localize$1("scss.builtin.selector-nest", "Nests selector beneath one another like they would be nested in the stylesheet.") },
    { func: "selector-append($selectors\u2026)", desc: localize$1("scss.builtin.selector-append", "Appends selectors to one another without spaces in between.") },
    { func: "selector-extend($selector, $extendee, $extender)", desc: localize$1("scss.builtin.selector-extend", "Extends $extendee with $extender within $selector.") },
    { func: "selector-replace($selector, $original, $replacement)", desc: localize$1("scss.builtin.selector-replace", "Replaces $original with $replacement within $selector.") },
    { func: "selector-unify($selector1, $selector2)", desc: localize$1("scss.builtin.selector-unify", "Unifies two selectors to produce a selector that matches elements matched by both.") },
    { func: "is-superselector($super, $sub)", desc: localize$1("scss.builtin.is-superselector", "Returns whether $super matches all the elements $sub does, and possibly more.") },
    { func: "simple-selectors($selector)", desc: localize$1("scss.builtin.simple-selectors", "Returns the simple selectors that comprise a compound selector.") },
    { func: "selector-parse($selector)", desc: localize$1("scss.builtin.selector-parse", "Parses a selector into the format returned by &.") }
  ];
  SCSSCompletion.builtInFuncs = [
    { func: "unquote($string)", desc: localize$1("scss.builtin.unquote", "Removes quotes from a string.") },
    { func: "quote($string)", desc: localize$1("scss.builtin.quote", "Adds quotes to a string.") },
    { func: "str-length($string)", desc: localize$1("scss.builtin.str-length", "Returns the number of characters in a string.") },
    { func: "str-insert($string, $insert, $index)", desc: localize$1("scss.builtin.str-insert", "Inserts $insert into $string at $index.") },
    { func: "str-index($string, $substring)", desc: localize$1("scss.builtin.str-index", "Returns the index of the first occurance of $substring in $string.") },
    { func: "str-slice($string, $start-at, [$end-at])", desc: localize$1("scss.builtin.str-slice", "Extracts a substring from $string.") },
    { func: "to-upper-case($string)", desc: localize$1("scss.builtin.to-upper-case", "Converts a string to upper case.") },
    { func: "to-lower-case($string)", desc: localize$1("scss.builtin.to-lower-case", "Converts a string to lower case.") },
    { func: "percentage($number)", desc: localize$1("scss.builtin.percentage", "Converts a unitless number to a percentage."), type: "percentage" },
    { func: "round($number)", desc: localize$1("scss.builtin.round", "Rounds a number to the nearest whole number.") },
    { func: "ceil($number)", desc: localize$1("scss.builtin.ceil", "Rounds a number up to the next whole number.") },
    { func: "floor($number)", desc: localize$1("scss.builtin.floor", "Rounds a number down to the previous whole number.") },
    { func: "abs($number)", desc: localize$1("scss.builtin.abs", "Returns the absolute value of a number.") },
    { func: "min($numbers)", desc: localize$1("scss.builtin.min", "Finds the minimum of several numbers.") },
    { func: "max($numbers)", desc: localize$1("scss.builtin.max", "Finds the maximum of several numbers.") },
    { func: "random([$limit])", desc: localize$1("scss.builtin.random", "Returns a random number.") },
    { func: "length($list)", desc: localize$1("scss.builtin.length", "Returns the length of a list.") },
    { func: "nth($list, $n)", desc: localize$1("scss.builtin.nth", "Returns a specific item in a list.") },
    { func: "set-nth($list, $n, $value)", desc: localize$1("scss.builtin.set-nth", "Replaces the nth item in a list.") },
    { func: "join($list1, $list2, [$separator])", desc: localize$1("scss.builtin.join", "Joins together two lists into one.") },
    { func: "append($list1, $val, [$separator])", desc: localize$1("scss.builtin.append", "Appends a single value onto the end of a list.") },
    { func: "zip($lists)", desc: localize$1("scss.builtin.zip", "Combines several lists into a single multidimensional list.") },
    { func: "index($list, $value)", desc: localize$1("scss.builtin.index", "Returns the position of a value within a list.") },
    { func: "list-separator(#list)", desc: localize$1("scss.builtin.list-separator", "Returns the separator of a list.") },
    { func: "map-get($map, $key)", desc: localize$1("scss.builtin.map-get", "Returns the value in a map associated with a given key.") },
    { func: "map-merge($map1, $map2)", desc: localize$1("scss.builtin.map-merge", "Merges two maps together into a new map.") },
    { func: "map-remove($map, $keys)", desc: localize$1("scss.builtin.map-remove", "Returns a new map with keys removed.") },
    { func: "map-keys($map)", desc: localize$1("scss.builtin.map-keys", "Returns a list of all keys in a map.") },
    { func: "map-values($map)", desc: localize$1("scss.builtin.map-values", "Returns a list of all values in a map.") },
    { func: "map-has-key($map, $key)", desc: localize$1("scss.builtin.map-has-key", "Returns whether a map has a value associated with a given key.") },
    { func: "keywords($args)", desc: localize$1("scss.builtin.keywords", "Returns the keywords passed to a function that takes variable arguments.") },
    { func: "feature-exists($feature)", desc: localize$1("scss.builtin.feature-exists", "Returns whether a feature exists in the current Sass runtime.") },
    { func: "variable-exists($name)", desc: localize$1("scss.builtin.variable-exists", "Returns whether a variable with the given name exists in the current scope.") },
    { func: "global-variable-exists($name)", desc: localize$1("scss.builtin.global-variable-exists", "Returns whether a variable with the given name exists in the global scope.") },
    { func: "function-exists($name)", desc: localize$1("scss.builtin.function-exists", "Returns whether a function with the given name exists.") },
    { func: "mixin-exists($name)", desc: localize$1("scss.builtin.mixin-exists", "Returns whether a mixin with the given name exists.") },
    { func: "inspect($value)", desc: localize$1("scss.builtin.inspect", "Returns the string representation of a value as it would be represented in Sass.") },
    { func: "type-of($value)", desc: localize$1("scss.builtin.type-of", "Returns the type of a value.") },
    { func: "unit($number)", desc: localize$1("scss.builtin.unit", "Returns the unit(s) associated with a number.") },
    { func: "unitless($number)", desc: localize$1("scss.builtin.unitless", "Returns whether a number has units.") },
    { func: "comparable($number1, $number2)", desc: localize$1("scss.builtin.comparable", "Returns whether two numbers can be added, subtracted, or compared.") },
    { func: "call($name, $args\u2026)", desc: localize$1("scss.builtin.call", "Dynamically calls a Sass function.") }
  ];
  SCSSCompletion.scssAtDirectives = [
    {
      label: "@extend",
      documentation: localize$1("scss.builtin.@extend", "Inherits the styles of another selector."),
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@at-root",
      documentation: localize$1("scss.builtin.@at-root", "Causes one or more rules to be emitted at the root of the document."),
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@debug",
      documentation: localize$1("scss.builtin.@debug", "Prints the value of an expression to the standard error output stream. Useful for debugging complicated Sass files."),
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@warn",
      documentation: localize$1("scss.builtin.@warn", "Prints the value of an expression to the standard error output stream. Useful for libraries that need to warn users of deprecations or recovering from minor mixin usage mistakes. Warnings can be turned off with the `--quiet` command-line option or the `:quiet` Sass option."),
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@error",
      documentation: localize$1("scss.builtin.@error", "Throws the value of an expression as a fatal error with stack trace. Useful for validating arguments to mixins and functions."),
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@if",
      documentation: localize$1("scss.builtin.@if", "Includes the body if the expression does not evaluate to `false` or `null`."),
      insertText: "@if ${1:expr} {\n	$0\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@for",
      documentation: localize$1("scss.builtin.@for", "For loop that repeatedly outputs a set of styles for each `$var` in the `from/through` or `from/to` clause."),
      insertText: "@for \\$${1:var} from ${2:start} ${3|to,through|} ${4:end} {\n	$0\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@each",
      documentation: localize$1("scss.builtin.@each", "Each loop that sets `$var` to each item in the list or map, then outputs the styles it contains using that value of `$var`."),
      insertText: "@each \\$${1:var} in ${2:list} {\n	$0\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@while",
      documentation: localize$1("scss.builtin.@while", "While loop that takes an expression and repeatedly outputs the nested styles until the statement evaluates to `false`."),
      insertText: "@while ${1:condition} {\n	$0\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@mixin",
      documentation: localize$1("scss.builtin.@mixin", "Defines styles that can be re-used throughout the stylesheet with `@include`."),
      insertText: "@mixin ${1:name} {\n	$0\n}",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@include",
      documentation: localize$1("scss.builtin.@include", "Includes the styles defined by another mixin into the current rule."),
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@function",
      documentation: localize$1("scss.builtin.@function", "Defines complex operations that can be re-used throughout stylesheets."),
      kind: CompletionItemKind.Keyword
    }
  ];
  SCSSCompletion.scssModuleLoaders = [
    {
      label: "@use",
      documentation: localize$1("scss.builtin.@use", "Loads mixins, functions, and variables from other Sass stylesheets as 'modules', and combines CSS from multiple stylesheets together."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/at-rules/use" }],
      insertText: "@use $0;",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    },
    {
      label: "@forward",
      documentation: localize$1("scss.builtin.@forward", "Loads a Sass stylesheet and makes its mixins, functions, and variables available when this stylesheet is loaded with the @use rule."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/at-rules/forward" }],
      insertText: "@forward $0;",
      insertTextFormat: InsertTextFormat.Snippet,
      kind: CompletionItemKind.Keyword
    }
  ];
  SCSSCompletion.scssModuleBuiltIns = [
    {
      label: "sass:math",
      documentation: localize$1("scss.builtin.sass:math", "Provides functions that operate on numbers."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/math" }]
    },
    {
      label: "sass:string",
      documentation: localize$1("scss.builtin.sass:string", "Makes it easy to combine, search, or split apart strings."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/string" }]
    },
    {
      label: "sass:color",
      documentation: localize$1("scss.builtin.sass:color", "Generates new colors based on existing ones, making it easy to build color themes."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/color" }]
    },
    {
      label: "sass:list",
      documentation: localize$1("scss.builtin.sass:list", "Lets you access and modify values in lists."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/list" }]
    },
    {
      label: "sass:map",
      documentation: localize$1("scss.builtin.sass:map", "Makes it possible to look up the value associated with a key in a map, and much more."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/map" }]
    },
    {
      label: "sass:selector",
      documentation: localize$1("scss.builtin.sass:selector", "Provides access to Sass\u2019s powerful selector engine."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/selector" }]
    },
    {
      label: "sass:meta",
      documentation: localize$1("scss.builtin.sass:meta", "Exposes the details of Sass\u2019s inner workings."),
      references: [{ name: "Sass documentation", url: "https://sass-lang.com/documentation/modules/meta" }]
    }
  ];
  return SCSSCompletion;
})(CSSCompletion);
function addReferencesToDocumentation(items) {
  items.forEach(function(i) {
    if (i.documentation && i.references && i.references.length > 0) {
      var markdownDoc = typeof i.documentation === "string" ? { kind: "markdown", value: i.documentation } : { kind: "markdown", value: i.documentation.value };
      markdownDoc.value += "\n\n";
      markdownDoc.value += i.references.map(function(r) {
        return "[" + r.name + "](" + r.url + ")";
      }).join(" | ");
      i.documentation = markdownDoc;
    }
  });
}
var __extends$3 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var _FSL = "/".charCodeAt(0);
var _NWL = "\n".charCodeAt(0);
var _CAR = "\r".charCodeAt(0);
var _LFD = "\f".charCodeAt(0);
var _TIC = "`".charCodeAt(0);
var _DOT = ".".charCodeAt(0);
var customTokenValue = TokenType.CustomToken;
var Ellipsis = customTokenValue++;
var LESSScanner = function(_super) {
  __extends$3(LESSScanner2, _super);
  function LESSScanner2() {
    return _super !== null && _super.apply(this, arguments) || this;
  }
  LESSScanner2.prototype.scanNext = function(offset) {
    var tokenType = this.escapedJavaScript();
    if (tokenType !== null) {
      return this.finishToken(offset, tokenType);
    }
    if (this.stream.advanceIfChars([_DOT, _DOT, _DOT])) {
      return this.finishToken(offset, Ellipsis);
    }
    return _super.prototype.scanNext.call(this, offset);
  };
  LESSScanner2.prototype.comment = function() {
    if (_super.prototype.comment.call(this)) {
      return true;
    }
    if (!this.inURL && this.stream.advanceIfChars([_FSL, _FSL])) {
      this.stream.advanceWhileChar(function(ch) {
        switch (ch) {
          case _NWL:
          case _CAR:
          case _LFD:
            return false;
          default:
            return true;
        }
      });
      return true;
    } else {
      return false;
    }
  };
  LESSScanner2.prototype.escapedJavaScript = function() {
    var ch = this.stream.peekChar();
    if (ch === _TIC) {
      this.stream.advance(1);
      this.stream.advanceWhileChar(function(ch2) {
        return ch2 !== _TIC;
      });
      return this.stream.advanceIfChar(_TIC) ? TokenType.EscapedJavaScript : TokenType.BadEscapedJavaScript;
    }
    return null;
  };
  return LESSScanner2;
}(Scanner);
var __extends$2 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
(function(_super) {
  __extends$2(LESSParser, _super);
  function LESSParser() {
    return _super.call(this, new LESSScanner()) || this;
  }
  LESSParser.prototype._parseStylesheetStatement = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    if (this.peek(TokenType.AtKeyword)) {
      return this._parseVariableDeclaration() || this._parsePlugin() || _super.prototype._parseStylesheetAtStatement.call(this, isNested);
    }
    return this._tryParseMixinDeclaration() || this._tryParseMixinReference() || this._parseFunction() || this._parseRuleset(true);
  };
  LESSParser.prototype._parseImport = function() {
    if (!this.peekKeyword("@import") && !this.peekKeyword("@import-once")) {
      return null;
    }
    var node = this.create(Import);
    this.consumeToken();
    if (this.accept(TokenType.ParenthesisL)) {
      if (!this.accept(TokenType.Ident)) {
        return this.finish(node, ParseError.IdentifierExpected, [TokenType.SemiColon]);
      }
      do {
        if (!this.accept(TokenType.Comma)) {
          break;
        }
      } while (this.accept(TokenType.Ident));
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected, [TokenType.SemiColon]);
      }
    }
    if (!node.addChild(this._parseURILiteral()) && !node.addChild(this._parseStringLiteral())) {
      return this.finish(node, ParseError.URIOrStringExpected, [TokenType.SemiColon]);
    }
    if (!this.peek(TokenType.SemiColon) && !this.peek(TokenType.EOF)) {
      node.setMedialist(this._parseMediaQueryList());
    }
    return this.finish(node);
  };
  LESSParser.prototype._parsePlugin = function() {
    if (!this.peekKeyword("@plugin")) {
      return null;
    }
    var node = this.createNode(NodeType.Plugin);
    this.consumeToken();
    if (!node.addChild(this._parseStringLiteral())) {
      return this.finish(node, ParseError.StringLiteralExpected);
    }
    if (!this.accept(TokenType.SemiColon)) {
      return this.finish(node, ParseError.SemiColonExpected);
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseMediaQuery = function(resyncStopToken) {
    var node = _super.prototype._parseMediaQuery.call(this, resyncStopToken);
    if (!node) {
      var node_1 = this.create(MediaQuery);
      if (node_1.addChild(this._parseVariable())) {
        return this.finish(node_1);
      }
      return null;
    }
    return node;
  };
  LESSParser.prototype._parseMediaDeclaration = function(isNested) {
    if (isNested === void 0) {
      isNested = false;
    }
    return this._tryParseRuleset(isNested) || this._tryToParseDeclaration() || this._tryParseMixinDeclaration() || this._tryParseMixinReference() || this._parseDetachedRuleSetMixin() || this._parseStylesheetStatement(isNested);
  };
  LESSParser.prototype._parseMediaFeatureName = function() {
    return this._parseIdent() || this._parseVariable();
  };
  LESSParser.prototype._parseVariableDeclaration = function(panic) {
    if (panic === void 0) {
      panic = [];
    }
    var node = this.create(VariableDeclaration);
    var mark = this.mark();
    if (!node.setVariable(this._parseVariable(true))) {
      return null;
    }
    if (this.accept(TokenType.Colon)) {
      if (this.prevToken) {
        node.colonPosition = this.prevToken.offset;
      }
      if (node.setValue(this._parseDetachedRuleSet())) {
        node.needsSemicolon = false;
      } else if (!node.setValue(this._parseExpr())) {
        return this.finish(node, ParseError.VariableValueExpected, [], panic);
      }
      node.addChild(this._parsePrio());
    } else {
      this.restoreAtMark(mark);
      return null;
    }
    if (this.peek(TokenType.SemiColon)) {
      node.semicolonPosition = this.token.offset;
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseDetachedRuleSet = function() {
    var mark = this.mark();
    if (this.peekDelim("#") || this.peekDelim(".")) {
      this.consumeToken();
      if (!this.hasWhitespace() && this.accept(TokenType.ParenthesisL)) {
        var node = this.create(MixinDeclaration);
        if (node.getParameters().addChild(this._parseMixinParameter())) {
          while (this.accept(TokenType.Comma) || this.accept(TokenType.SemiColon)) {
            if (this.peek(TokenType.ParenthesisR)) {
              break;
            }
            if (!node.getParameters().addChild(this._parseMixinParameter())) {
              this.markError(node, ParseError.IdentifierExpected, [], [TokenType.ParenthesisR]);
            }
          }
        }
        if (!this.accept(TokenType.ParenthesisR)) {
          this.restoreAtMark(mark);
          return null;
        }
      } else {
        this.restoreAtMark(mark);
        return null;
      }
    }
    if (!this.peek(TokenType.CurlyL)) {
      return null;
    }
    var content = this.create(BodyDeclaration);
    this._parseBody(content, this._parseDetachedRuleSetBody.bind(this));
    return this.finish(content);
  };
  LESSParser.prototype._parseDetachedRuleSetBody = function() {
    return this._tryParseKeyframeSelector() || this._parseRuleSetDeclaration();
  };
  LESSParser.prototype._addLookupChildren = function(node) {
    if (!node.addChild(this._parseLookupValue())) {
      return false;
    }
    var expectsValue = false;
    while (true) {
      if (this.peek(TokenType.BracketL)) {
        expectsValue = true;
      }
      if (!node.addChild(this._parseLookupValue())) {
        break;
      }
      expectsValue = false;
    }
    return !expectsValue;
  };
  LESSParser.prototype._parseLookupValue = function() {
    var node = this.create(Node);
    var mark = this.mark();
    if (!this.accept(TokenType.BracketL)) {
      this.restoreAtMark(mark);
      return null;
    }
    if ((node.addChild(this._parseVariable(false, true)) || node.addChild(this._parsePropertyIdentifier())) && this.accept(TokenType.BracketR) || this.accept(TokenType.BracketR)) {
      return node;
    }
    this.restoreAtMark(mark);
    return null;
  };
  LESSParser.prototype._parseVariable = function(declaration, insideLookup) {
    if (declaration === void 0) {
      declaration = false;
    }
    if (insideLookup === void 0) {
      insideLookup = false;
    }
    var isPropertyReference = !declaration && this.peekDelim("$");
    if (!this.peekDelim("@") && !isPropertyReference && !this.peek(TokenType.AtKeyword)) {
      return null;
    }
    var node = this.create(Variable);
    var mark = this.mark();
    while (this.acceptDelim("@") || !declaration && this.acceptDelim("$")) {
      if (this.hasWhitespace()) {
        this.restoreAtMark(mark);
        return null;
      }
    }
    if (!this.accept(TokenType.AtKeyword) && !this.accept(TokenType.Ident)) {
      this.restoreAtMark(mark);
      return null;
    }
    if (!insideLookup && this.peek(TokenType.BracketL)) {
      if (!this._addLookupChildren(node)) {
        this.restoreAtMark(mark);
        return null;
      }
    }
    return node;
  };
  LESSParser.prototype._parseTermExpression = function() {
    return this._parseVariable() || this._parseEscaped() || _super.prototype._parseTermExpression.call(this) || this._tryParseMixinReference(false);
  };
  LESSParser.prototype._parseEscaped = function() {
    if (this.peek(TokenType.EscapedJavaScript) || this.peek(TokenType.BadEscapedJavaScript)) {
      var node = this.createNode(NodeType.EscapedValue);
      this.consumeToken();
      return this.finish(node);
    }
    if (this.peekDelim("~")) {
      var node = this.createNode(NodeType.EscapedValue);
      this.consumeToken();
      if (this.accept(TokenType.String) || this.accept(TokenType.EscapedJavaScript)) {
        return this.finish(node);
      } else {
        return this.finish(node, ParseError.TermExpected);
      }
    }
    return null;
  };
  LESSParser.prototype._parseOperator = function() {
    var node = this._parseGuardOperator();
    if (node) {
      return node;
    } else {
      return _super.prototype._parseOperator.call(this);
    }
  };
  LESSParser.prototype._parseGuardOperator = function() {
    if (this.peekDelim(">")) {
      var node = this.createNode(NodeType.Operator);
      this.consumeToken();
      this.acceptDelim("=");
      return node;
    } else if (this.peekDelim("=")) {
      var node = this.createNode(NodeType.Operator);
      this.consumeToken();
      this.acceptDelim("<");
      return node;
    } else if (this.peekDelim("<")) {
      var node = this.createNode(NodeType.Operator);
      this.consumeToken();
      this.acceptDelim("=");
      return node;
    }
    return null;
  };
  LESSParser.prototype._parseRuleSetDeclaration = function() {
    if (this.peek(TokenType.AtKeyword)) {
      return this._parseKeyframe() || this._parseMedia(true) || this._parseImport() || this._parseSupports(true) || this._parseDetachedRuleSetMixin() || this._parseVariableDeclaration() || _super.prototype._parseRuleSetDeclarationAtStatement.call(this);
    }
    return this._tryParseMixinDeclaration() || this._tryParseRuleset(true) || this._tryParseMixinReference() || this._parseFunction() || this._parseExtend() || _super.prototype._parseRuleSetDeclaration.call(this);
  };
  LESSParser.prototype._parseKeyframeIdent = function() {
    return this._parseIdent([ReferenceType.Keyframe]) || this._parseVariable();
  };
  LESSParser.prototype._parseKeyframeSelector = function() {
    return this._parseDetachedRuleSetMixin() || _super.prototype._parseKeyframeSelector.call(this);
  };
  LESSParser.prototype._parseSimpleSelectorBody = function() {
    return this._parseSelectorCombinator() || _super.prototype._parseSimpleSelectorBody.call(this);
  };
  LESSParser.prototype._parseSelector = function(isNested) {
    var node = this.create(Selector);
    var hasContent = false;
    if (isNested) {
      hasContent = node.addChild(this._parseCombinator());
    }
    while (node.addChild(this._parseSimpleSelector())) {
      hasContent = true;
      var mark = this.mark();
      if (node.addChild(this._parseGuard()) && this.peek(TokenType.CurlyL)) {
        break;
      }
      this.restoreAtMark(mark);
      node.addChild(this._parseCombinator());
    }
    return hasContent ? this.finish(node) : null;
  };
  LESSParser.prototype._parseSelectorCombinator = function() {
    if (this.peekDelim("&")) {
      var node = this.createNode(NodeType.SelectorCombinator);
      this.consumeToken();
      while (!this.hasWhitespace() && (this.acceptDelim("-") || this.accept(TokenType.Num) || this.accept(TokenType.Dimension) || node.addChild(this._parseIdent()) || this.acceptDelim("&"))) {
      }
      return this.finish(node);
    }
    return null;
  };
  LESSParser.prototype._parseSelectorIdent = function() {
    if (!this.peekInterpolatedIdent()) {
      return null;
    }
    var node = this.createNode(NodeType.SelectorInterpolation);
    var hasContent = this._acceptInterpolatedIdent(node);
    return hasContent ? this.finish(node) : null;
  };
  LESSParser.prototype._parsePropertyIdentifier = function(inLookup) {
    if (inLookup === void 0) {
      inLookup = false;
    }
    var propertyRegex = /^[\w-]+/;
    if (!this.peekInterpolatedIdent() && !this.peekRegExp(this.token.type, propertyRegex)) {
      return null;
    }
    var mark = this.mark();
    var node = this.create(Identifier);
    node.isCustomProperty = this.acceptDelim("-") && this.acceptDelim("-");
    var childAdded = false;
    if (!inLookup) {
      if (node.isCustomProperty) {
        childAdded = this._acceptInterpolatedIdent(node);
      } else {
        childAdded = this._acceptInterpolatedIdent(node, propertyRegex);
      }
    } else {
      if (node.isCustomProperty) {
        childAdded = node.addChild(this._parseIdent());
      } else {
        childAdded = node.addChild(this._parseRegexp(propertyRegex));
      }
    }
    if (!childAdded) {
      this.restoreAtMark(mark);
      return null;
    }
    if (!inLookup && !this.hasWhitespace()) {
      this.acceptDelim("+");
      if (!this.hasWhitespace()) {
        this.acceptIdent("_");
      }
    }
    return this.finish(node);
  };
  LESSParser.prototype.peekInterpolatedIdent = function() {
    return this.peek(TokenType.Ident) || this.peekDelim("@") || this.peekDelim("$") || this.peekDelim("-");
  };
  LESSParser.prototype._acceptInterpolatedIdent = function(node, identRegex) {
    var _this = this;
    var hasContent = false;
    var indentInterpolation = function() {
      var pos = _this.mark();
      if (_this.acceptDelim("-")) {
        if (!_this.hasWhitespace()) {
          _this.acceptDelim("-");
        }
        if (_this.hasWhitespace()) {
          _this.restoreAtMark(pos);
          return null;
        }
      }
      return _this._parseInterpolation();
    };
    var accept = identRegex ? function() {
      return _this.acceptRegexp(identRegex);
    } : function() {
      return _this.accept(TokenType.Ident);
    };
    while (accept() || node.addChild(this._parseInterpolation() || this.try(indentInterpolation))) {
      hasContent = true;
      if (this.hasWhitespace()) {
        break;
      }
    }
    return hasContent;
  };
  LESSParser.prototype._parseInterpolation = function() {
    var mark = this.mark();
    if (this.peekDelim("@") || this.peekDelim("$")) {
      var node = this.createNode(NodeType.Interpolation);
      this.consumeToken();
      if (this.hasWhitespace() || !this.accept(TokenType.CurlyL)) {
        this.restoreAtMark(mark);
        return null;
      }
      if (!node.addChild(this._parseIdent())) {
        return this.finish(node, ParseError.IdentifierExpected);
      }
      if (!this.accept(TokenType.CurlyR)) {
        return this.finish(node, ParseError.RightCurlyExpected);
      }
      return this.finish(node);
    }
    return null;
  };
  LESSParser.prototype._tryParseMixinDeclaration = function() {
    var mark = this.mark();
    var node = this.create(MixinDeclaration);
    if (!node.setIdentifier(this._parseMixinDeclarationIdentifier()) || !this.accept(TokenType.ParenthesisL)) {
      this.restoreAtMark(mark);
      return null;
    }
    if (node.getParameters().addChild(this._parseMixinParameter())) {
      while (this.accept(TokenType.Comma) || this.accept(TokenType.SemiColon)) {
        if (this.peek(TokenType.ParenthesisR)) {
          break;
        }
        if (!node.getParameters().addChild(this._parseMixinParameter())) {
          this.markError(node, ParseError.IdentifierExpected, [], [TokenType.ParenthesisR]);
        }
      }
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      this.restoreAtMark(mark);
      return null;
    }
    node.setGuard(this._parseGuard());
    if (!this.peek(TokenType.CurlyL)) {
      this.restoreAtMark(mark);
      return null;
    }
    return this._parseBody(node, this._parseMixInBodyDeclaration.bind(this));
  };
  LESSParser.prototype._parseMixInBodyDeclaration = function() {
    return this._parseFontFace() || this._parseRuleSetDeclaration();
  };
  LESSParser.prototype._parseMixinDeclarationIdentifier = function() {
    var identifier;
    if (this.peekDelim("#") || this.peekDelim(".")) {
      identifier = this.create(Identifier);
      this.consumeToken();
      if (this.hasWhitespace() || !identifier.addChild(this._parseIdent())) {
        return null;
      }
    } else if (this.peek(TokenType.Hash)) {
      identifier = this.create(Identifier);
      this.consumeToken();
    } else {
      return null;
    }
    identifier.referenceTypes = [ReferenceType.Mixin];
    return this.finish(identifier);
  };
  LESSParser.prototype._parsePseudo = function() {
    if (!this.peek(TokenType.Colon)) {
      return null;
    }
    var mark = this.mark();
    var node = this.create(ExtendsReference);
    this.consumeToken();
    if (this.acceptIdent("extend")) {
      return this._completeExtends(node);
    }
    this.restoreAtMark(mark);
    return _super.prototype._parsePseudo.call(this);
  };
  LESSParser.prototype._parseExtend = function() {
    if (!this.peekDelim("&")) {
      return null;
    }
    var mark = this.mark();
    var node = this.create(ExtendsReference);
    this.consumeToken();
    if (this.hasWhitespace() || !this.accept(TokenType.Colon) || !this.acceptIdent("extend")) {
      this.restoreAtMark(mark);
      return null;
    }
    return this._completeExtends(node);
  };
  LESSParser.prototype._completeExtends = function(node) {
    if (!this.accept(TokenType.ParenthesisL)) {
      return this.finish(node, ParseError.LeftParenthesisExpected);
    }
    var selectors = node.getSelectors();
    if (!selectors.addChild(this._parseSelector(true))) {
      return this.finish(node, ParseError.SelectorExpected);
    }
    while (this.accept(TokenType.Comma)) {
      if (!selectors.addChild(this._parseSelector(true))) {
        return this.finish(node, ParseError.SelectorExpected);
      }
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseDetachedRuleSetMixin = function() {
    if (!this.peek(TokenType.AtKeyword)) {
      return null;
    }
    var mark = this.mark();
    var node = this.create(MixinReference);
    if (node.addChild(this._parseVariable(true)) && (this.hasWhitespace() || !this.accept(TokenType.ParenthesisL))) {
      this.restoreAtMark(mark);
      return null;
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  LESSParser.prototype._tryParseMixinReference = function(atRoot) {
    if (atRoot === void 0) {
      atRoot = true;
    }
    var mark = this.mark();
    var node = this.create(MixinReference);
    var identifier = this._parseMixinDeclarationIdentifier();
    while (identifier) {
      this.acceptDelim(">");
      var nextId = this._parseMixinDeclarationIdentifier();
      if (nextId) {
        node.getNamespaces().addChild(identifier);
        identifier = nextId;
      } else {
        break;
      }
    }
    if (!node.setIdentifier(identifier)) {
      this.restoreAtMark(mark);
      return null;
    }
    var hasArguments = false;
    if (this.accept(TokenType.ParenthesisL)) {
      hasArguments = true;
      if (node.getArguments().addChild(this._parseMixinArgument())) {
        while (this.accept(TokenType.Comma) || this.accept(TokenType.SemiColon)) {
          if (this.peek(TokenType.ParenthesisR)) {
            break;
          }
          if (!node.getArguments().addChild(this._parseMixinArgument())) {
            return this.finish(node, ParseError.ExpressionExpected);
          }
        }
      }
      if (!this.accept(TokenType.ParenthesisR)) {
        return this.finish(node, ParseError.RightParenthesisExpected);
      }
      identifier.referenceTypes = [ReferenceType.Mixin];
    } else {
      identifier.referenceTypes = [ReferenceType.Mixin, ReferenceType.Rule];
    }
    if (this.peek(TokenType.BracketL)) {
      if (!atRoot) {
        this._addLookupChildren(node);
      }
    } else {
      node.addChild(this._parsePrio());
    }
    if (!hasArguments && !this.peek(TokenType.SemiColon) && !this.peek(TokenType.CurlyR) && !this.peek(TokenType.EOF)) {
      this.restoreAtMark(mark);
      return null;
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseMixinArgument = function() {
    var node = this.create(FunctionArgument);
    var pos = this.mark();
    var argument = this._parseVariable();
    if (argument) {
      if (!this.accept(TokenType.Colon)) {
        this.restoreAtMark(pos);
      } else {
        node.setIdentifier(argument);
      }
    }
    if (node.setValue(this._parseDetachedRuleSet() || this._parseExpr(true))) {
      return this.finish(node);
    }
    this.restoreAtMark(pos);
    return null;
  };
  LESSParser.prototype._parseMixinParameter = function() {
    var node = this.create(FunctionParameter);
    if (this.peekKeyword("@rest")) {
      var restNode = this.create(Node);
      this.consumeToken();
      if (!this.accept(Ellipsis)) {
        return this.finish(node, ParseError.DotExpected, [], [TokenType.Comma, TokenType.ParenthesisR]);
      }
      node.setIdentifier(this.finish(restNode));
      return this.finish(node);
    }
    if (this.peek(Ellipsis)) {
      var varargsNode = this.create(Node);
      this.consumeToken();
      node.setIdentifier(this.finish(varargsNode));
      return this.finish(node);
    }
    var hasContent = false;
    if (node.setIdentifier(this._parseVariable())) {
      this.accept(TokenType.Colon);
      hasContent = true;
    }
    if (!node.setDefaultValue(this._parseDetachedRuleSet() || this._parseExpr(true)) && !hasContent) {
      return null;
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseGuard = function() {
    if (!this.peekIdent("when")) {
      return null;
    }
    var node = this.create(LessGuard);
    this.consumeToken();
    node.isNegated = this.acceptIdent("not");
    if (!node.getConditions().addChild(this._parseGuardCondition())) {
      return this.finish(node, ParseError.ConditionExpected);
    }
    while (this.acceptIdent("and") || this.accept(TokenType.Comma)) {
      if (!node.getConditions().addChild(this._parseGuardCondition())) {
        return this.finish(node, ParseError.ConditionExpected);
      }
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseGuardCondition = function() {
    if (!this.peek(TokenType.ParenthesisL)) {
      return null;
    }
    var node = this.create(GuardCondition);
    this.consumeToken();
    if (!node.addChild(this._parseExpr()))
      ;
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseFunction = function() {
    var pos = this.mark();
    var node = this.create(Function);
    if (!node.setIdentifier(this._parseFunctionIdentifier())) {
      return null;
    }
    if (this.hasWhitespace() || !this.accept(TokenType.ParenthesisL)) {
      this.restoreAtMark(pos);
      return null;
    }
    if (node.getArguments().addChild(this._parseMixinArgument())) {
      while (this.accept(TokenType.Comma) || this.accept(TokenType.SemiColon)) {
        if (this.peek(TokenType.ParenthesisR)) {
          break;
        }
        if (!node.getArguments().addChild(this._parseMixinArgument())) {
          return this.finish(node, ParseError.ExpressionExpected);
        }
      }
    }
    if (!this.accept(TokenType.ParenthesisR)) {
      return this.finish(node, ParseError.RightParenthesisExpected);
    }
    return this.finish(node);
  };
  LESSParser.prototype._parseFunctionIdentifier = function() {
    if (this.peekDelim("%")) {
      var node = this.create(Identifier);
      node.referenceTypes = [ReferenceType.Function];
      this.consumeToken();
      return this.finish(node);
    }
    return _super.prototype._parseFunctionIdentifier.call(this);
  };
  LESSParser.prototype._parseURLArgument = function() {
    var pos = this.mark();
    var node = _super.prototype._parseURLArgument.call(this);
    if (!node || !this.peek(TokenType.ParenthesisR)) {
      this.restoreAtMark(pos);
      var node_2 = this.create(Node);
      node_2.addChild(this._parseBinaryExpr());
      return this.finish(node_2);
    }
    return node;
  };
  return LESSParser;
})(Parser);
var __extends$1 = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var localize = loadMessageBundle();
(function(_super) {
  __extends$1(LESSCompletion, _super);
  function LESSCompletion(lsOptions, cssDataManager) {
    return _super.call(this, "@", lsOptions, cssDataManager) || this;
  }
  LESSCompletion.prototype.createFunctionProposals = function(proposals, existingNode, sortToEnd, result) {
    for (var _i = 0, proposals_1 = proposals; _i < proposals_1.length; _i++) {
      var p = proposals_1[_i];
      var item = {
        label: p.name,
        detail: p.example,
        documentation: p.description,
        textEdit: TextEdit.replace(this.getCompletionRange(existingNode), p.name + "($0)"),
        insertTextFormat: InsertTextFormat.Snippet,
        kind: CompletionItemKind.Function
      };
      if (sortToEnd) {
        item.sortText = "z";
      }
      result.items.push(item);
    }
    return result;
  };
  LESSCompletion.prototype.getTermProposals = function(entry, existingNode, result) {
    var functions = LESSCompletion.builtInProposals;
    if (entry) {
      functions = functions.filter(function(f2) {
        return !f2.type || !entry.restrictions || entry.restrictions.indexOf(f2.type) !== -1;
      });
    }
    this.createFunctionProposals(functions, existingNode, true, result);
    return _super.prototype.getTermProposals.call(this, entry, existingNode, result);
  };
  LESSCompletion.prototype.getColorProposals = function(entry, existingNode, result) {
    this.createFunctionProposals(LESSCompletion.colorProposals, existingNode, false, result);
    return _super.prototype.getColorProposals.call(this, entry, existingNode, result);
  };
  LESSCompletion.prototype.getCompletionsForDeclarationProperty = function(declaration, result) {
    this.getCompletionsForSelector(null, true, result);
    return _super.prototype.getCompletionsForDeclarationProperty.call(this, declaration, result);
  };
  LESSCompletion.builtInProposals = [
    {
      "name": "if",
      "example": "if(condition, trueValue [, falseValue]);",
      "description": localize("less.builtin.if", "returns one of two values depending on a condition.")
    },
    {
      "name": "boolean",
      "example": "boolean(condition);",
      "description": localize("less.builtin.boolean", '"store" a boolean test for later evaluation in a guard or if().')
    },
    {
      "name": "length",
      "example": "length(@list);",
      "description": localize("less.builtin.length", "returns the number of elements in a value list")
    },
    {
      "name": "extract",
      "example": "extract(@list, index);",
      "description": localize("less.builtin.extract", "returns a value at the specified position in the list")
    },
    {
      "name": "range",
      "example": "range([start, ] end [, step]);",
      "description": localize("less.builtin.range", "generate a list spanning a range of values")
    },
    {
      "name": "each",
      "example": "each(@list, ruleset);",
      "description": localize("less.builtin.each", "bind the evaluation of a ruleset to each member of a list.")
    },
    {
      "name": "escape",
      "example": "escape(@string);",
      "description": localize("less.builtin.escape", "URL encodes a string")
    },
    {
      "name": "e",
      "example": "e(@string);",
      "description": localize("less.builtin.e", "escape string content")
    },
    {
      "name": "replace",
      "example": "replace(@string, @pattern, @replacement[, @flags]);",
      "description": localize("less.builtin.replace", "string replace")
    },
    {
      "name": "unit",
      "example": "unit(@dimension, [@unit: '']);",
      "description": localize("less.builtin.unit", "remove or change the unit of a dimension")
    },
    {
      "name": "color",
      "example": "color(@string);",
      "description": localize("less.builtin.color", "parses a string to a color"),
      "type": "color"
    },
    {
      "name": "convert",
      "example": "convert(@value, unit);",
      "description": localize("less.builtin.convert", "converts numbers from one type into another")
    },
    {
      "name": "data-uri",
      "example": "data-uri([mimetype,] url);",
      "description": localize("less.builtin.data-uri", "inlines a resource and falls back to `url()`"),
      "type": "url"
    },
    {
      "name": "abs",
      "description": localize("less.builtin.abs", "absolute value of a number"),
      "example": "abs(number);"
    },
    {
      "name": "acos",
      "description": localize("less.builtin.acos", "arccosine - inverse of cosine function"),
      "example": "acos(number);"
    },
    {
      "name": "asin",
      "description": localize("less.builtin.asin", "arcsine - inverse of sine function"),
      "example": "asin(number);"
    },
    {
      "name": "ceil",
      "example": "ceil(@number);",
      "description": localize("less.builtin.ceil", "rounds up to an integer")
    },
    {
      "name": "cos",
      "description": localize("less.builtin.cos", "cosine function"),
      "example": "cos(number);"
    },
    {
      "name": "floor",
      "description": localize("less.builtin.floor", "rounds down to an integer"),
      "example": "floor(@number);"
    },
    {
      "name": "percentage",
      "description": localize("less.builtin.percentage", "converts to a %, e.g. 0.5 > 50%"),
      "example": "percentage(@number);",
      "type": "percentage"
    },
    {
      "name": "round",
      "description": localize("less.builtin.round", "rounds a number to a number of places"),
      "example": "round(number, [places: 0]);"
    },
    {
      "name": "sqrt",
      "description": localize("less.builtin.sqrt", "calculates square root of a number"),
      "example": "sqrt(number);"
    },
    {
      "name": "sin",
      "description": localize("less.builtin.sin", "sine function"),
      "example": "sin(number);"
    },
    {
      "name": "tan",
      "description": localize("less.builtin.tan", "tangent function"),
      "example": "tan(number);"
    },
    {
      "name": "atan",
      "description": localize("less.builtin.atan", "arctangent - inverse of tangent function"),
      "example": "atan(number);"
    },
    {
      "name": "pi",
      "description": localize("less.builtin.pi", "returns pi"),
      "example": "pi();"
    },
    {
      "name": "pow",
      "description": localize("less.builtin.pow", "first argument raised to the power of the second argument"),
      "example": "pow(@base, @exponent);"
    },
    {
      "name": "mod",
      "description": localize("less.builtin.mod", "first argument modulus second argument"),
      "example": "mod(number, number);"
    },
    {
      "name": "min",
      "description": localize("less.builtin.min", "returns the lowest of one or more values"),
      "example": "min(@x, @y);"
    },
    {
      "name": "max",
      "description": localize("less.builtin.max", "returns the lowest of one or more values"),
      "example": "max(@x, @y);"
    }
  ];
  LESSCompletion.colorProposals = [
    {
      "name": "argb",
      "example": "argb(@color);",
      "description": localize("less.builtin.argb", "creates a #AARRGGBB")
    },
    {
      "name": "hsl",
      "example": "hsl(@hue, @saturation, @lightness);",
      "description": localize("less.builtin.hsl", "creates a color")
    },
    {
      "name": "hsla",
      "example": "hsla(@hue, @saturation, @lightness, @alpha);",
      "description": localize("less.builtin.hsla", "creates a color")
    },
    {
      "name": "hsv",
      "example": "hsv(@hue, @saturation, @value);",
      "description": localize("less.builtin.hsv", "creates a color")
    },
    {
      "name": "hsva",
      "example": "hsva(@hue, @saturation, @value, @alpha);",
      "description": localize("less.builtin.hsva", "creates a color")
    },
    {
      "name": "hue",
      "example": "hue(@color);",
      "description": localize("less.builtin.hue", "returns the `hue` channel of `@color` in the HSL space")
    },
    {
      "name": "saturation",
      "example": "saturation(@color);",
      "description": localize("less.builtin.saturation", "returns the `saturation` channel of `@color` in the HSL space")
    },
    {
      "name": "lightness",
      "example": "lightness(@color);",
      "description": localize("less.builtin.lightness", "returns the `lightness` channel of `@color` in the HSL space")
    },
    {
      "name": "hsvhue",
      "example": "hsvhue(@color);",
      "description": localize("less.builtin.hsvhue", "returns the `hue` channel of `@color` in the HSV space")
    },
    {
      "name": "hsvsaturation",
      "example": "hsvsaturation(@color);",
      "description": localize("less.builtin.hsvsaturation", "returns the `saturation` channel of `@color` in the HSV space")
    },
    {
      "name": "hsvvalue",
      "example": "hsvvalue(@color);",
      "description": localize("less.builtin.hsvvalue", "returns the `value` channel of `@color` in the HSV space")
    },
    {
      "name": "red",
      "example": "red(@color);",
      "description": localize("less.builtin.red", "returns the `red` channel of `@color`")
    },
    {
      "name": "green",
      "example": "green(@color);",
      "description": localize("less.builtin.green", "returns the `green` channel of `@color`")
    },
    {
      "name": "blue",
      "example": "blue(@color);",
      "description": localize("less.builtin.blue", "returns the `blue` channel of `@color`")
    },
    {
      "name": "alpha",
      "example": "alpha(@color);",
      "description": localize("less.builtin.alpha", "returns the `alpha` channel of `@color`")
    },
    {
      "name": "luma",
      "example": "luma(@color);",
      "description": localize("less.builtin.luma", "returns the `luma` value (perceptual brightness) of `@color`")
    },
    {
      "name": "saturate",
      "example": "saturate(@color, 10%);",
      "description": localize("less.builtin.saturate", "return `@color` 10% points more saturated")
    },
    {
      "name": "desaturate",
      "example": "desaturate(@color, 10%);",
      "description": localize("less.builtin.desaturate", "return `@color` 10% points less saturated")
    },
    {
      "name": "lighten",
      "example": "lighten(@color, 10%);",
      "description": localize("less.builtin.lighten", "return `@color` 10% points lighter")
    },
    {
      "name": "darken",
      "example": "darken(@color, 10%);",
      "description": localize("less.builtin.darken", "return `@color` 10% points darker")
    },
    {
      "name": "fadein",
      "example": "fadein(@color, 10%);",
      "description": localize("less.builtin.fadein", "return `@color` 10% points less transparent")
    },
    {
      "name": "fadeout",
      "example": "fadeout(@color, 10%);",
      "description": localize("less.builtin.fadeout", "return `@color` 10% points more transparent")
    },
    {
      "name": "fade",
      "example": "fade(@color, 50%);",
      "description": localize("less.builtin.fade", "return `@color` with 50% transparency")
    },
    {
      "name": "spin",
      "example": "spin(@color, 10);",
      "description": localize("less.builtin.spin", "return `@color` with a 10 degree larger in hue")
    },
    {
      "name": "mix",
      "example": "mix(@color1, @color2, [@weight: 50%]);",
      "description": localize("less.builtin.mix", "return a mix of `@color1` and `@color2`")
    },
    {
      "name": "greyscale",
      "example": "greyscale(@color);",
      "description": localize("less.builtin.greyscale", "returns a grey, 100% desaturated color")
    },
    {
      "name": "contrast",
      "example": "contrast(@color1, [@darkcolor: black], [@lightcolor: white], [@threshold: 43%]);",
      "description": localize("less.builtin.contrast", "return `@darkcolor` if `@color1 is> 43% luma` otherwise return `@lightcolor`, see notes")
    },
    {
      "name": "multiply",
      "example": "multiply(@color1, @color2);"
    },
    {
      "name": "screen",
      "example": "screen(@color1, @color2);"
    },
    {
      "name": "overlay",
      "example": "overlay(@color1, @color2);"
    },
    {
      "name": "softlight",
      "example": "softlight(@color1, @color2);"
    },
    {
      "name": "hardlight",
      "example": "hardlight(@color1, @color2);"
    },
    {
      "name": "difference",
      "example": "difference(@color1, @color2);"
    },
    {
      "name": "exclusion",
      "example": "exclusion(@color1, @color2);"
    },
    {
      "name": "average",
      "example": "average(@color1, @color2);"
    },
    {
      "name": "negation",
      "example": "negation(@color1, @color2);"
    }
  ];
  return LESSCompletion;
})(CSSCompletion);
var __extends = function() {
  var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
      d2.__proto__ = b2;
    } || function(d2, b2) {
      for (var p in b2)
        if (Object.prototype.hasOwnProperty.call(b2, p))
          d2[p] = b2[p];
    };
    return extendStatics(d, b);
  };
  return function(d, b) {
    if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
      this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
  };
}();
var __awaiter = function(thisArg, _arguments, P, generator) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
};
var __generator = function(thisArg, body) {
  var _ = { label: 0, sent: function() {
    if (t[0] & 1)
      throw t[1];
    return t[1];
  }, trys: [], ops: [] }, f2, y, t, g;
  return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
    return this;
  }), g;
  function verb(n) {
    return function(v) {
      return step([n, v]);
    };
  }
  function step(op) {
    if (f2)
      throw new TypeError("Generator is already executing.");
    while (_)
      try {
        if (f2 = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
          return t;
        if (y = 0, t)
          op = [op[0] & 2, t.value];
        switch (op[0]) {
          case 0:
          case 1:
            t = op;
            break;
          case 4:
            _.label++;
            return { value: op[1], done: false };
          case 5:
            _.label++;
            y = op[1];
            op = [0];
            continue;
          case 7:
            op = _.ops.pop();
            _.trys.pop();
            continue;
          default:
            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
              _ = 0;
              continue;
            }
            if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
              _.label = op[1];
              break;
            }
            if (op[0] === 6 && _.label < t[1]) {
              _.label = t[1];
              t = op;
              break;
            }
            if (t && _.label < t[2]) {
              _.label = t[2];
              _.ops.push(op);
              break;
            }
            if (t[2])
              _.ops.pop();
            _.trys.pop();
            continue;
        }
        op = body.call(thisArg, _);
      } catch (e) {
        op = [6, e];
        y = 0;
      } finally {
        f2 = t = 0;
      }
    if (op[0] & 5)
      throw op[1];
    return { value: op[0] ? op[1] : void 0, done: true };
  }
};
(function(_super) {
  __extends(SCSSNavigation, _super);
  function SCSSNavigation(fileSystemProvider) {
    return _super.call(this, fileSystemProvider) || this;
  }
  SCSSNavigation.prototype.isRawStringDocumentLinkNode = function(node) {
    return _super.prototype.isRawStringDocumentLinkNode.call(this, node) || node.type === NodeType.Use || node.type === NodeType.Forward;
  };
  SCSSNavigation.prototype.resolveRelativeReference = function(ref, documentUri, documentContext, isRawLink) {
    return __awaiter(this, void 0, void 0, function() {
      function toPathVariations(uri) {
        if (uri.path === "") {
          return void 0;
        }
        if (uri.path.endsWith(".scss") || uri.path.endsWith(".css")) {
          return void 0;
        }
        if (uri.path.endsWith("/")) {
          return [
            uri.with({ path: uri.path + "index.scss" }).toString(),
            uri.with({ path: uri.path + "_index.scss" }).toString()
          ];
        }
        var pathFragments = uri.path.split("/");
        var basename = pathFragments[pathFragments.length - 1];
        var pathWithoutBasename = uri.path.slice(0, -basename.length);
        if (basename.startsWith("_")) {
          if (uri.path.endsWith(".scss")) {
            return void 0;
          } else {
            return [uri.with({ path: uri.path + ".scss" }).toString()];
          }
        }
        var normalizedBasename = basename + ".scss";
        var documentUriWithBasename = function(newBasename) {
          return uri.with({ path: pathWithoutBasename + newBasename }).toString();
        };
        var normalizedPath = documentUriWithBasename(normalizedBasename);
        var underScorePath = documentUriWithBasename("_" + normalizedBasename);
        var indexPath = documentUriWithBasename(normalizedBasename.slice(0, -5) + "/index.scss");
        var indexUnderscoreUri = documentUriWithBasename(normalizedBasename.slice(0, -5) + "/_index.scss");
        var cssPath = documentUriWithBasename(normalizedBasename.slice(0, -5) + ".css");
        return [normalizedPath, underScorePath, indexPath, indexUnderscoreUri, cssPath];
      }
      var target, parsedUri, pathVariations, j;
      return __generator(this, function(_a2) {
        switch (_a2.label) {
          case 0:
            if (startsWith(ref, "sass:")) {
              return [2, void 0];
            }
            return [4, _super.prototype.resolveRelativeReference.call(this, ref, documentUri, documentContext, isRawLink)];
          case 1:
            target = _a2.sent();
            if (!(this.fileSystemProvider && target && isRawLink))
              return [3, 8];
            parsedUri = URI.parse(target);
            _a2.label = 2;
          case 2:
            _a2.trys.push([2, 7, , 8]);
            pathVariations = toPathVariations(parsedUri);
            if (!pathVariations)
              return [3, 6];
            j = 0;
            _a2.label = 3;
          case 3:
            if (!(j < pathVariations.length))
              return [3, 6];
            return [4, this.fileExists(pathVariations[j])];
          case 4:
            if (_a2.sent()) {
              return [2, pathVariations[j]];
            }
            _a2.label = 5;
          case 5:
            j++;
            return [3, 3];
          case 6:
            return [3, 8];
          case 7:
            _a2.sent();
            return [3, 8];
          case 8:
            return [2, target];
        }
      });
    });
  };
  return SCSSNavigation;
})(CSSNavigation);
var DiagnosticsAdapter = function() {
  function DiagnosticsAdapter2(_languageId, _worker, defaults) {
    var _this = this;
    this._languageId = _languageId;
    this._worker = _worker;
    this._disposables = [];
    this._listener = Object.create(null);
    var onModelAdd = function(model) {
      var modeId = model.getModeId();
      if (modeId !== _this._languageId) {
        return;
      }
      var handle;
      _this._listener[model.uri.toString()] = model.onDidChangeContent(function() {
        window.clearTimeout(handle);
        handle = window.setTimeout(function() {
          return _this._doValidate(model.uri, modeId);
        }, 500);
      });
      _this._doValidate(model.uri, modeId);
    };
    var onModelRemoved = function(model) {
      editor.setModelMarkers(model, _this._languageId, []);
      var uriStr = model.uri.toString();
      var listener = _this._listener[uriStr];
      if (listener) {
        listener.dispose();
        delete _this._listener[uriStr];
      }
    };
    this._disposables.push(editor.onDidCreateModel(onModelAdd));
    this._disposables.push(editor.onWillDisposeModel(onModelRemoved));
    this._disposables.push(editor.onDidChangeModelLanguage(function(event) {
      onModelRemoved(event.model);
      onModelAdd(event.model);
    }));
    defaults.onDidChange(function(_) {
      editor.getModels().forEach(function(model) {
        if (model.getModeId() === _this._languageId) {
          onModelRemoved(model);
          onModelAdd(model);
        }
      });
    });
    this._disposables.push({
      dispose: function() {
        for (var key in _this._listener) {
          _this._listener[key].dispose();
        }
      }
    });
    editor.getModels().forEach(onModelAdd);
  }
  DiagnosticsAdapter2.prototype.dispose = function() {
    this._disposables.forEach(function(d) {
      return d && d.dispose();
    });
    this._disposables = [];
  };
  DiagnosticsAdapter2.prototype._doValidate = function(resource, languageId) {
    this._worker(resource).then(function(worker) {
      return worker.doValidation(resource.toString());
    }).then(function(diagnostics) {
      var markers = diagnostics.map(function(d) {
        return toDiagnostics(resource, d);
      });
      var model = editor.getModel(resource);
      if (model && model.getModeId() === languageId) {
        editor.setModelMarkers(model, languageId, markers);
      }
    }).then(void 0, function(err) {
      console.error(err);
    });
  };
  return DiagnosticsAdapter2;
}();
function toSeverity(lsSeverity) {
  switch (lsSeverity) {
    case DiagnosticSeverity.Error:
      return MarkerSeverity.Error;
    case DiagnosticSeverity.Warning:
      return MarkerSeverity.Warning;
    case DiagnosticSeverity.Information:
      return MarkerSeverity.Info;
    case DiagnosticSeverity.Hint:
      return MarkerSeverity.Hint;
    default:
      return MarkerSeverity.Info;
  }
}
function toDiagnostics(resource, diag) {
  var code = typeof diag.code === "number" ? String(diag.code) : diag.code;
  return {
    severity: toSeverity(diag.severity),
    startLineNumber: diag.range.start.line + 1,
    startColumn: diag.range.start.character + 1,
    endLineNumber: diag.range.end.line + 1,
    endColumn: diag.range.end.character + 1,
    message: diag.message,
    code,
    source: diag.source
  };
}
function fromPosition(position) {
  if (!position) {
    return void 0;
  }
  return { character: position.column - 1, line: position.lineNumber - 1 };
}
function fromRange(range) {
  if (!range) {
    return void 0;
  }
  return {
    start: {
      line: range.startLineNumber - 1,
      character: range.startColumn - 1
    },
    end: { line: range.endLineNumber - 1, character: range.endColumn - 1 }
  };
}
function toRange(range) {
  if (!range) {
    return void 0;
  }
  return new Range$1(range.start.line + 1, range.start.character + 1, range.end.line + 1, range.end.character + 1);
}
function isInsertReplaceEdit(edit) {
  return typeof edit.insert !== "undefined" && typeof edit.replace !== "undefined";
}
function toCompletionItemKind(kind) {
  var mItemKind = languages.CompletionItemKind;
  switch (kind) {
    case CompletionItemKind.Text:
      return mItemKind.Text;
    case CompletionItemKind.Method:
      return mItemKind.Method;
    case CompletionItemKind.Function:
      return mItemKind.Function;
    case CompletionItemKind.Constructor:
      return mItemKind.Constructor;
    case CompletionItemKind.Field:
      return mItemKind.Field;
    case CompletionItemKind.Variable:
      return mItemKind.Variable;
    case CompletionItemKind.Class:
      return mItemKind.Class;
    case CompletionItemKind.Interface:
      return mItemKind.Interface;
    case CompletionItemKind.Module:
      return mItemKind.Module;
    case CompletionItemKind.Property:
      return mItemKind.Property;
    case CompletionItemKind.Unit:
      return mItemKind.Unit;
    case CompletionItemKind.Value:
      return mItemKind.Value;
    case CompletionItemKind.Enum:
      return mItemKind.Enum;
    case CompletionItemKind.Keyword:
      return mItemKind.Keyword;
    case CompletionItemKind.Snippet:
      return mItemKind.Snippet;
    case CompletionItemKind.Color:
      return mItemKind.Color;
    case CompletionItemKind.File:
      return mItemKind.File;
    case CompletionItemKind.Reference:
      return mItemKind.Reference;
  }
  return mItemKind.Property;
}
function toTextEdit(textEdit) {
  if (!textEdit) {
    return void 0;
  }
  return {
    range: toRange(textEdit.range),
    text: textEdit.newText
  };
}
function toCommand(c) {
  return c && c.command === "editor.action.triggerSuggest" ? { id: c.command, title: c.title, arguments: c.arguments } : void 0;
}
var CompletionAdapter = function() {
  function CompletionAdapter2(_worker) {
    this._worker = _worker;
  }
  Object.defineProperty(CompletionAdapter2.prototype, "triggerCharacters", {
    get: function() {
      return ["/", "-", ":"];
    },
    enumerable: false,
    configurable: true
  });
  CompletionAdapter2.prototype.provideCompletionItems = function(model, position, context, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.doComplete(resource.toString(), fromPosition(position));
    }).then(function(info) {
      if (!info) {
        return;
      }
      var wordInfo = model.getWordUntilPosition(position);
      var wordRange = new Range$1(position.lineNumber, wordInfo.startColumn, position.lineNumber, wordInfo.endColumn);
      var items = info.items.map(function(entry) {
        var item = {
          label: entry.label,
          insertText: entry.insertText || entry.label,
          sortText: entry.sortText,
          filterText: entry.filterText,
          documentation: entry.documentation,
          detail: entry.detail,
          command: toCommand(entry.command),
          range: wordRange,
          kind: toCompletionItemKind(entry.kind)
        };
        if (entry.textEdit) {
          if (isInsertReplaceEdit(entry.textEdit)) {
            item.range = {
              insert: toRange(entry.textEdit.insert),
              replace: toRange(entry.textEdit.replace)
            };
          } else {
            item.range = toRange(entry.textEdit.range);
          }
          item.insertText = entry.textEdit.newText;
        }
        if (entry.additionalTextEdits) {
          item.additionalTextEdits = entry.additionalTextEdits.map(toTextEdit);
        }
        if (entry.insertTextFormat === InsertTextFormat.Snippet) {
          item.insertTextRules = languages.CompletionItemInsertTextRule.InsertAsSnippet;
        }
        return item;
      });
      return {
        isIncomplete: info.isIncomplete,
        suggestions: items
      };
    });
  };
  return CompletionAdapter2;
}();
function isMarkupContent(thing) {
  return thing && typeof thing === "object" && typeof thing.kind === "string";
}
function toMarkdownString(entry) {
  if (typeof entry === "string") {
    return {
      value: entry
    };
  }
  if (isMarkupContent(entry)) {
    if (entry.kind === "plaintext") {
      return {
        value: entry.value.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&")
      };
    }
    return {
      value: entry.value
    };
  }
  return { value: "```" + entry.language + "\n" + entry.value + "\n```\n" };
}
function toMarkedStringArray(contents) {
  if (!contents) {
    return void 0;
  }
  if (Array.isArray(contents)) {
    return contents.map(toMarkdownString);
  }
  return [toMarkdownString(contents)];
}
var HoverAdapter = function() {
  function HoverAdapter2(_worker) {
    this._worker = _worker;
  }
  HoverAdapter2.prototype.provideHover = function(model, position, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.doHover(resource.toString(), fromPosition(position));
    }).then(function(info) {
      if (!info) {
        return;
      }
      return {
        range: toRange(info.range),
        contents: toMarkedStringArray(info.contents)
      };
    });
  };
  return HoverAdapter2;
}();
function toDocumentHighlightKind(kind) {
  switch (kind) {
    case DocumentHighlightKind.Read:
      return languages.DocumentHighlightKind.Read;
    case DocumentHighlightKind.Write:
      return languages.DocumentHighlightKind.Write;
    case DocumentHighlightKind.Text:
      return languages.DocumentHighlightKind.Text;
  }
  return languages.DocumentHighlightKind.Text;
}
var DocumentHighlightAdapter = function() {
  function DocumentHighlightAdapter2(_worker) {
    this._worker = _worker;
  }
  DocumentHighlightAdapter2.prototype.provideDocumentHighlights = function(model, position, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDocumentHighlights(resource.toString(), fromPosition(position));
    }).then(function(entries) {
      if (!entries) {
        return;
      }
      return entries.map(function(entry) {
        return {
          range: toRange(entry.range),
          kind: toDocumentHighlightKind(entry.kind)
        };
      });
    });
  };
  return DocumentHighlightAdapter2;
}();
function toLocation(location) {
  return {
    uri: Uri.parse(location.uri),
    range: toRange(location.range)
  };
}
var DefinitionAdapter = function() {
  function DefinitionAdapter2(_worker) {
    this._worker = _worker;
  }
  DefinitionAdapter2.prototype.provideDefinition = function(model, position, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDefinition(resource.toString(), fromPosition(position));
    }).then(function(definition) {
      if (!definition) {
        return;
      }
      return [toLocation(definition)];
    });
  };
  return DefinitionAdapter2;
}();
var ReferenceAdapter = function() {
  function ReferenceAdapter2(_worker) {
    this._worker = _worker;
  }
  ReferenceAdapter2.prototype.provideReferences = function(model, position, context, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findReferences(resource.toString(), fromPosition(position));
    }).then(function(entries) {
      if (!entries) {
        return;
      }
      return entries.map(toLocation);
    });
  };
  return ReferenceAdapter2;
}();
function toWorkspaceEdit(edit) {
  if (!edit || !edit.changes) {
    return void 0;
  }
  var resourceEdits = [];
  for (var uri in edit.changes) {
    var _uri = Uri.parse(uri);
    for (var _i = 0, _a2 = edit.changes[uri]; _i < _a2.length; _i++) {
      var e = _a2[_i];
      resourceEdits.push({
        resource: _uri,
        edit: {
          range: toRange(e.range),
          text: e.newText
        }
      });
    }
  }
  return {
    edits: resourceEdits
  };
}
var RenameAdapter = function() {
  function RenameAdapter2(_worker) {
    this._worker = _worker;
  }
  RenameAdapter2.prototype.provideRenameEdits = function(model, position, newName, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.doRename(resource.toString(), fromPosition(position), newName);
    }).then(function(edit) {
      return toWorkspaceEdit(edit);
    });
  };
  return RenameAdapter2;
}();
function toSymbolKind(kind) {
  var mKind = languages.SymbolKind;
  switch (kind) {
    case SymbolKind.File:
      return mKind.Array;
    case SymbolKind.Module:
      return mKind.Module;
    case SymbolKind.Namespace:
      return mKind.Namespace;
    case SymbolKind.Package:
      return mKind.Package;
    case SymbolKind.Class:
      return mKind.Class;
    case SymbolKind.Method:
      return mKind.Method;
    case SymbolKind.Property:
      return mKind.Property;
    case SymbolKind.Field:
      return mKind.Field;
    case SymbolKind.Constructor:
      return mKind.Constructor;
    case SymbolKind.Enum:
      return mKind.Enum;
    case SymbolKind.Interface:
      return mKind.Interface;
    case SymbolKind.Function:
      return mKind.Function;
    case SymbolKind.Variable:
      return mKind.Variable;
    case SymbolKind.Constant:
      return mKind.Constant;
    case SymbolKind.String:
      return mKind.String;
    case SymbolKind.Number:
      return mKind.Number;
    case SymbolKind.Boolean:
      return mKind.Boolean;
    case SymbolKind.Array:
      return mKind.Array;
  }
  return mKind.Function;
}
var DocumentSymbolAdapter = function() {
  function DocumentSymbolAdapter2(_worker) {
    this._worker = _worker;
  }
  DocumentSymbolAdapter2.prototype.provideDocumentSymbols = function(model, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDocumentSymbols(resource.toString());
    }).then(function(items) {
      if (!items) {
        return;
      }
      return items.map(function(item) {
        return {
          name: item.name,
          detail: "",
          containerName: item.containerName,
          kind: toSymbolKind(item.kind),
          tags: [],
          range: toRange(item.location.range),
          selectionRange: toRange(item.location.range)
        };
      });
    });
  };
  return DocumentSymbolAdapter2;
}();
var DocumentColorAdapter = function() {
  function DocumentColorAdapter2(_worker) {
    this._worker = _worker;
  }
  DocumentColorAdapter2.prototype.provideDocumentColors = function(model, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.findDocumentColors(resource.toString());
    }).then(function(infos) {
      if (!infos) {
        return;
      }
      return infos.map(function(item) {
        return {
          color: item.color,
          range: toRange(item.range)
        };
      });
    });
  };
  DocumentColorAdapter2.prototype.provideColorPresentations = function(model, info, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.getColorPresentations(resource.toString(), info.color, fromRange(info.range));
    }).then(function(presentations) {
      if (!presentations) {
        return;
      }
      return presentations.map(function(presentation) {
        var item = {
          label: presentation.label
        };
        if (presentation.textEdit) {
          item.textEdit = toTextEdit(presentation.textEdit);
        }
        if (presentation.additionalTextEdits) {
          item.additionalTextEdits = presentation.additionalTextEdits.map(toTextEdit);
        }
        return item;
      });
    });
  };
  return DocumentColorAdapter2;
}();
var FoldingRangeAdapter = function() {
  function FoldingRangeAdapter2(_worker) {
    this._worker = _worker;
  }
  FoldingRangeAdapter2.prototype.provideFoldingRanges = function(model, context, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.getFoldingRanges(resource.toString(), context);
    }).then(function(ranges) {
      if (!ranges) {
        return;
      }
      return ranges.map(function(range) {
        var result = {
          start: range.startLine + 1,
          end: range.endLine + 1
        };
        if (typeof range.kind !== "undefined") {
          result.kind = toFoldingRangeKind(range.kind);
        }
        return result;
      });
    });
  };
  return FoldingRangeAdapter2;
}();
function toFoldingRangeKind(kind) {
  switch (kind) {
    case FoldingRangeKind.Comment:
      return languages.FoldingRangeKind.Comment;
    case FoldingRangeKind.Imports:
      return languages.FoldingRangeKind.Imports;
    case FoldingRangeKind.Region:
      return languages.FoldingRangeKind.Region;
  }
}
var SelectionRangeAdapter = function() {
  function SelectionRangeAdapter2(_worker) {
    this._worker = _worker;
  }
  SelectionRangeAdapter2.prototype.provideSelectionRanges = function(model, positions, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.getSelectionRanges(resource.toString(), positions.map(fromPosition));
    }).then(function(selectionRanges) {
      if (!selectionRanges) {
        return;
      }
      return selectionRanges.map(function(selectionRange) {
        var result = [];
        while (selectionRange) {
          result.push({ range: toRange(selectionRange.range) });
          selectionRange = selectionRange.parent;
        }
        return result;
      });
    });
  };
  return SelectionRangeAdapter2;
}();
function setupMode(defaults) {
  var disposables = [];
  var providers = [];
  var client = new WorkerManager(defaults);
  disposables.push(client);
  var worker = function() {
    var uris = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      uris[_i] = arguments[_i];
    }
    return client.getLanguageServiceWorker.apply(client, uris);
  };
  function registerProviders() {
    var languageId = defaults.languageId, modeConfiguration = defaults.modeConfiguration;
    disposeAll(providers);
    if (modeConfiguration.completionItems) {
      providers.push(languages.registerCompletionItemProvider(languageId, new CompletionAdapter(worker)));
    }
    if (modeConfiguration.hovers) {
      providers.push(languages.registerHoverProvider(languageId, new HoverAdapter(worker)));
    }
    if (modeConfiguration.documentHighlights) {
      providers.push(languages.registerDocumentHighlightProvider(languageId, new DocumentHighlightAdapter(worker)));
    }
    if (modeConfiguration.definitions) {
      providers.push(languages.registerDefinitionProvider(languageId, new DefinitionAdapter(worker)));
    }
    if (modeConfiguration.references) {
      providers.push(languages.registerReferenceProvider(languageId, new ReferenceAdapter(worker)));
    }
    if (modeConfiguration.documentSymbols) {
      providers.push(languages.registerDocumentSymbolProvider(languageId, new DocumentSymbolAdapter(worker)));
    }
    if (modeConfiguration.rename) {
      providers.push(languages.registerRenameProvider(languageId, new RenameAdapter(worker)));
    }
    if (modeConfiguration.colors) {
      providers.push(languages.registerColorProvider(languageId, new DocumentColorAdapter(worker)));
    }
    if (modeConfiguration.foldingRanges) {
      providers.push(languages.registerFoldingRangeProvider(languageId, new FoldingRangeAdapter(worker)));
    }
    if (modeConfiguration.diagnostics) {
      providers.push(new DiagnosticsAdapter(languageId, worker, defaults));
    }
    if (modeConfiguration.selectionRanges) {
      providers.push(languages.registerSelectionRangeProvider(languageId, new SelectionRangeAdapter(worker)));
    }
  }
  registerProviders();
  disposables.push(asDisposable(providers));
  return asDisposable(disposables);
}
function asDisposable(disposables) {
  return { dispose: function() {
    return disposeAll(disposables);
  } };
}
function disposeAll(disposables) {
  while (disposables.length) {
    disposables.pop().dispose();
  }
}
export { setupMode };
