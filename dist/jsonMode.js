import { e as editor, R as Range$1, l as languages, a as MarkerSeverity } from "./index.js";
var STOP_WHEN_IDLE_FOR = 2 * 60 * 1e3;
var WorkerManager = function() {
  function WorkerManager2(defaults) {
    var _this = this;
    this._defaults = defaults;
    this._worker = null;
    this._idleCheckInterval = setInterval(function() {
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
        moduleId: "vs/language/json/jsonWorker",
        label: this._defaults.languageId,
        createData: {
          languageSettings: this._defaults.diagnosticsOptions,
          languageId: this._defaults.languageId,
          enableSchemaRequest: this._defaults.diagnosticsOptions.enableSchemaRequest
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
function createScanner$1(text, ignoreTrivia) {
  if (ignoreTrivia === void 0) {
    ignoreTrivia = false;
  }
  var len = text.length;
  var pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    var digits = 0;
    var value2 = 0;
    while (digits < count || !exact) {
      var ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    var start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    var end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    var result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      var ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        var ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            var ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    var code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      case 47:
        var start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          var safeLength = len - 1;
          var commentClosed = false;
          while (pos < safeLength) {
            var ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    var result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: function() {
      return pos;
    },
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: function() {
      return token;
    },
    getTokenValue: function() {
      return value;
    },
    getTokenOffset: function() {
      return tokenOffset;
    },
    getTokenLength: function() {
      return pos - tokenOffset;
    },
    getTokenStartLine: function() {
      return lineStartOffset;
    },
    getTokenStartCharacter: function() {
      return tokenOffset - prevTokenLineStartOffset;
    },
    getTokenError: function() {
      return scanError;
    }
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9 || ch === 11 || ch === 12 || ch === 160 || ch === 5760 || ch >= 8192 && ch <= 8203 || ch === 8239 || ch === 8287 || ch === 12288 || ch === 65279;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13 || ch === 8232 || ch === 8233;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse$1(text, errors, options) {
  if (errors === void 0) {
    errors = [];
  }
  if (options === void 0) {
    options = ParseOptions.DEFAULT;
  }
  var currentProperty = null;
  var currentParent = [];
  var previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  var visitor = {
    onObjectBegin: function() {
      var object = {};
      onValue(object);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: function(name) {
      currentProperty = name;
    },
    onObjectEnd: function() {
      currentParent = previousParents.pop();
    },
    onArrayBegin: function() {
      var array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: function() {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: function(error, offset, length) {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function getNodeValue$2(node) {
  switch (node.type) {
    case "array":
      return node.children.map(getNodeValue$2);
    case "object":
      var obj = Object.create(null);
      for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var prop = _a[_i];
        var valueNode = prop.children[1];
        if (valueNode) {
          obj[prop.children[0].value] = getNodeValue$2(valueNode);
        }
      }
      return obj;
    case "null":
    case "string":
    case "number":
    case "boolean":
      return node.value;
    default:
      return void 0;
  }
}
function visit(text, visitor, options) {
  if (options === void 0) {
    options = ParseOptions.DEFAULT;
  }
  var _scanner = createScanner$1(text, false);
  function toNoArgVisit(visitFunction) {
    return visitFunction ? function() {
      return visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
    } : function() {
      return true;
    };
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? function(arg) {
      return visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
    } : function() {
      return true;
    };
  }
  var onObjectBegin = toNoArgVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisit(visitor.onObjectProperty), onObjectEnd = toNoArgVisit(visitor.onObjectEnd), onArrayBegin = toNoArgVisit(visitor.onArrayBegin), onArrayEnd = toNoArgVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisit(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  var disallowComments = options && options.disallowComments;
  var allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      var token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(14);
          break;
        case 5:
          handleError(15);
          break;
        case 3:
          handleError(13);
          break;
        case 1:
          if (!disallowComments) {
            handleError(11);
          }
          break;
        case 2:
          handleError(12);
          break;
        case 6:
          handleError(16);
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(10);
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(1);
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter, skipUntil) {
    if (skipUntilAfter === void 0) {
      skipUntilAfter = [];
    }
    if (skipUntil === void 0) {
      skipUntil = [];
    }
    onError(error);
    if (skipUntilAfter.length + skipUntil.length > 0) {
      var token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString(isValue) {
    var value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        var tokenValue = _scanner.getTokenValue();
        var value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(2);
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [2, 5]);
      return false;
    }
    parseString(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue()) {
        handleError(4, [], [2, 5]);
      }
    } else {
      handleError(5, [], [2, 5]);
    }
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    var needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [2, 5]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [2], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray() {
    onArrayBegin();
    scanNext();
    var needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseValue()) {
        handleError(4, [], [4, 5]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (_scanner.getToken() !== 4) {
      handleError(8, [4], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray();
      case 1:
        return parseObject();
      case 10:
        return parseString(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}
var createScanner = createScanner$1;
var parse = parse$1;
var getNodeValue$1 = getNodeValue$2;
function isBoolean(val) {
  return typeof val === "boolean";
}
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
function extendedRegExp(pattern) {
  if (startsWith(pattern, "(?i)")) {
    return new RegExp(pattern.substring(4), "i");
  } else {
    return new RegExp(pattern);
  }
}
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
    var _a;
    var candidate = value;
    return Is.defined(candidate) && Range.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
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
    var sortedEdits = mergeSort2(edits, function(a, b) {
      var diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
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
    var sortedEdits = mergeSort(edits.map(getWellformedEdit), function(a, b) {
      var diff = a.range.start.line - b.range.start.line;
      if (diff === 0) {
        return a.range.start.character - b.range.start.character;
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
var ErrorCode;
(function(ErrorCode2) {
  ErrorCode2[ErrorCode2["Undefined"] = 0] = "Undefined";
  ErrorCode2[ErrorCode2["EnumValueMismatch"] = 1] = "EnumValueMismatch";
  ErrorCode2[ErrorCode2["Deprecated"] = 2] = "Deprecated";
  ErrorCode2[ErrorCode2["UnexpectedEndOfComment"] = 257] = "UnexpectedEndOfComment";
  ErrorCode2[ErrorCode2["UnexpectedEndOfString"] = 258] = "UnexpectedEndOfString";
  ErrorCode2[ErrorCode2["UnexpectedEndOfNumber"] = 259] = "UnexpectedEndOfNumber";
  ErrorCode2[ErrorCode2["InvalidUnicode"] = 260] = "InvalidUnicode";
  ErrorCode2[ErrorCode2["InvalidEscapeCharacter"] = 261] = "InvalidEscapeCharacter";
  ErrorCode2[ErrorCode2["InvalidCharacter"] = 262] = "InvalidCharacter";
  ErrorCode2[ErrorCode2["PropertyExpected"] = 513] = "PropertyExpected";
  ErrorCode2[ErrorCode2["CommaExpected"] = 514] = "CommaExpected";
  ErrorCode2[ErrorCode2["ColonExpected"] = 515] = "ColonExpected";
  ErrorCode2[ErrorCode2["ValueExpected"] = 516] = "ValueExpected";
  ErrorCode2[ErrorCode2["CommaOrCloseBacketExpected"] = 517] = "CommaOrCloseBacketExpected";
  ErrorCode2[ErrorCode2["CommaOrCloseBraceExpected"] = 518] = "CommaOrCloseBraceExpected";
  ErrorCode2[ErrorCode2["TrailingComma"] = 519] = "TrailingComma";
  ErrorCode2[ErrorCode2["DuplicateKey"] = 520] = "DuplicateKey";
  ErrorCode2[ErrorCode2["CommentNotPermitted"] = 521] = "CommentNotPermitted";
  ErrorCode2[ErrorCode2["SchemaResolveError"] = 768] = "SchemaResolveError";
})(ErrorCode || (ErrorCode = {}));
var ClientCapabilities;
(function(ClientCapabilities2) {
  ClientCapabilities2.LATEST = {
    textDocument: {
      completion: {
        completionItem: {
          documentationFormat: [MarkupKind.Markdown, MarkupKind.PlainText],
          commitCharactersSupport: true
        }
      }
    }
  };
})(ClientCapabilities || (ClientCapabilities = {}));
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
function localize$3(key, message) {
  var args = [];
  for (var _i = 2; _i < arguments.length; _i++) {
    args[_i - 2] = arguments[_i];
  }
  return format(message, args);
}
function loadMessageBundle(file) {
  return localize$3;
}
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
var localize$2 = loadMessageBundle();
({
  "color-hex": { errorMessage: localize$2("colorHexFormatWarning", "Invalid color format. Use #RGB, #RGBA, #RRGGBB or #RRGGBBAA."), pattern: /^#([0-9A-Fa-f]{3,4}|([0-9A-Fa-f]{2}){3,4})$/ },
  "date-time": { errorMessage: localize$2("dateTimeFormatWarning", "String is not a RFC3339 date-time."), pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i },
  "date": { errorMessage: localize$2("dateFormatWarning", "String is not a RFC3339 date."), pattern: /^(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/i },
  "time": { errorMessage: localize$2("timeFormatWarning", "String is not a RFC3339 time."), pattern: /^([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9]|60)(\.[0-9]+)?(Z|(\+|-)([01][0-9]|2[0-3]):([0-5][0-9]))$/i },
  "email": { errorMessage: localize$2("emailFormatWarning", "String is not an e-mail address."), pattern: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/ }
});
var ASTNodeImpl = function() {
  function ASTNodeImpl2(parent, offset, length) {
    if (length === void 0) {
      length = 0;
    }
    this.offset = offset;
    this.length = length;
    this.parent = parent;
  }
  Object.defineProperty(ASTNodeImpl2.prototype, "children", {
    get: function() {
      return [];
    },
    enumerable: false,
    configurable: true
  });
  ASTNodeImpl2.prototype.toString = function() {
    return "type: " + this.type + " (" + this.offset + "/" + this.length + ")" + (this.parent ? " parent: {" + this.parent.toString() + "}" : "");
  };
  return ASTNodeImpl2;
}();
(function(_super) {
  __extends(NullASTNodeImpl, _super);
  function NullASTNodeImpl(parent, offset) {
    var _this = _super.call(this, parent, offset) || this;
    _this.type = "null";
    _this.value = null;
    return _this;
  }
  return NullASTNodeImpl;
})(ASTNodeImpl);
(function(_super) {
  __extends(BooleanASTNodeImpl, _super);
  function BooleanASTNodeImpl(parent, boolValue, offset) {
    var _this = _super.call(this, parent, offset) || this;
    _this.type = "boolean";
    _this.value = boolValue;
    return _this;
  }
  return BooleanASTNodeImpl;
})(ASTNodeImpl);
(function(_super) {
  __extends(ArrayASTNodeImpl, _super);
  function ArrayASTNodeImpl(parent, offset) {
    var _this = _super.call(this, parent, offset) || this;
    _this.type = "array";
    _this.items = [];
    return _this;
  }
  Object.defineProperty(ArrayASTNodeImpl.prototype, "children", {
    get: function() {
      return this.items;
    },
    enumerable: false,
    configurable: true
  });
  return ArrayASTNodeImpl;
})(ASTNodeImpl);
(function(_super) {
  __extends(NumberASTNodeImpl, _super);
  function NumberASTNodeImpl(parent, offset) {
    var _this = _super.call(this, parent, offset) || this;
    _this.type = "number";
    _this.isInteger = true;
    _this.value = Number.NaN;
    return _this;
  }
  return NumberASTNodeImpl;
})(ASTNodeImpl);
(function(_super) {
  __extends(StringASTNodeImpl, _super);
  function StringASTNodeImpl(parent, offset, length) {
    var _this = _super.call(this, parent, offset, length) || this;
    _this.type = "string";
    _this.value = "";
    return _this;
  }
  return StringASTNodeImpl;
})(ASTNodeImpl);
(function(_super) {
  __extends(PropertyASTNodeImpl, _super);
  function PropertyASTNodeImpl(parent, offset, keyNode) {
    var _this = _super.call(this, parent, offset) || this;
    _this.type = "property";
    _this.colonOffset = -1;
    _this.keyNode = keyNode;
    return _this;
  }
  Object.defineProperty(PropertyASTNodeImpl.prototype, "children", {
    get: function() {
      return this.valueNode ? [this.keyNode, this.valueNode] : [this.keyNode];
    },
    enumerable: false,
    configurable: true
  });
  return PropertyASTNodeImpl;
})(ASTNodeImpl);
(function(_super) {
  __extends(ObjectASTNodeImpl, _super);
  function ObjectASTNodeImpl(parent, offset) {
    var _this = _super.call(this, parent, offset) || this;
    _this.type = "object";
    _this.properties = [];
    return _this;
  }
  Object.defineProperty(ObjectASTNodeImpl.prototype, "children", {
    get: function() {
      return this.properties;
    },
    enumerable: false,
    configurable: true
  });
  return ObjectASTNodeImpl;
})(ASTNodeImpl);
function asSchema(schema) {
  if (isBoolean(schema)) {
    return schema ? {} : { "not": {} };
  }
  return schema;
}
var EnumMatch;
(function(EnumMatch2) {
  EnumMatch2[EnumMatch2["Key"] = 0] = "Key";
  EnumMatch2[EnumMatch2["Enum"] = 1] = "Enum";
})(EnumMatch || (EnumMatch = {}));
(function() {
  function NoOpSchemaCollector() {
  }
  Object.defineProperty(NoOpSchemaCollector.prototype, "schemas", {
    get: function() {
      return [];
    },
    enumerable: false,
    configurable: true
  });
  NoOpSchemaCollector.prototype.add = function(schema) {
  };
  NoOpSchemaCollector.prototype.merge = function(other) {
  };
  NoOpSchemaCollector.prototype.include = function(node) {
    return true;
  };
  NoOpSchemaCollector.prototype.newSub = function() {
    return this;
  };
  NoOpSchemaCollector.instance = new NoOpSchemaCollector();
  return NoOpSchemaCollector;
})();
function getNodeValue(node) {
  return getNodeValue$1(node);
}
var LIB;
LIB = (() => {
  var t = { 470: (t2) => {
    function e2(t3) {
      if (typeof t3 != "string")
        throw new TypeError("Path must be a string. Received " + JSON.stringify(t3));
    }
    function r2(t3, e3) {
      for (var r3, n2 = "", o = 0, i = -1, a = 0, h = 0; h <= t3.length; ++h) {
        if (h < t3.length)
          r3 = t3.charCodeAt(h);
        else {
          if (r3 === 47)
            break;
          r3 = 47;
        }
        if (r3 === 47) {
          if (i === h - 1 || a === 1)
            ;
          else if (i !== h - 1 && a === 2) {
            if (n2.length < 2 || o !== 2 || n2.charCodeAt(n2.length - 1) !== 46 || n2.charCodeAt(n2.length - 2) !== 46) {
              if (n2.length > 2) {
                var s = n2.lastIndexOf("/");
                if (s !== n2.length - 1) {
                  s === -1 ? (n2 = "", o = 0) : o = (n2 = n2.slice(0, s)).length - 1 - n2.lastIndexOf("/"), i = h, a = 0;
                  continue;
                }
              } else if (n2.length === 2 || n2.length === 1) {
                n2 = "", o = 0, i = h, a = 0;
                continue;
              }
            }
            e3 && (n2.length > 0 ? n2 += "/.." : n2 = "..", o = 2);
          } else
            n2.length > 0 ? n2 += "/" + t3.slice(i + 1, h) : n2 = t3.slice(i + 1, h), o = h - i - 1;
          i = h, a = 0;
        } else
          r3 === 46 && a !== -1 ? ++a : a = -1;
      }
      return n2;
    }
    var n = { resolve: function() {
      for (var t3, n2 = "", o = false, i = arguments.length - 1; i >= -1 && !o; i--) {
        var a;
        i >= 0 ? a = arguments[i] : (t3 === void 0 && (t3 = process.cwd()), a = t3), e2(a), a.length !== 0 && (n2 = a + "/" + n2, o = a.charCodeAt(0) === 47);
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
      for (var i = t3.length, a = i - o, h = 1; h < r3.length && r3.charCodeAt(h) === 47; ++h)
        ;
      for (var s = r3.length - h, f = a < s ? a : s, u = -1, c = 0; c <= f; ++c) {
        if (c === f) {
          if (s > f) {
            if (r3.charCodeAt(h + c) === 47)
              return r3.slice(h + c + 1);
            if (c === 0)
              return r3.slice(h + c);
          } else
            a > f && (t3.charCodeAt(o + c) === 47 ? u = c : c === 0 && (u = 0));
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
      for (var r3 = t3.charCodeAt(0), n2 = r3 === 47, o = -1, i = true, a = t3.length - 1; a >= 1; --a)
        if ((r3 = t3.charCodeAt(a)) === 47) {
          if (!i) {
            o = a;
            break;
          }
        } else
          i = false;
      return o === -1 ? n2 ? "/" : "." : n2 && o === 1 ? "//" : t3.slice(0, o);
    }, basename: function(t3, r3) {
      if (r3 !== void 0 && typeof r3 != "string")
        throw new TypeError('"ext" argument must be a string');
      e2(t3);
      var n2, o = 0, i = -1, a = true;
      if (r3 !== void 0 && r3.length > 0 && r3.length <= t3.length) {
        if (r3.length === t3.length && r3 === t3)
          return "";
        var h = r3.length - 1, s = -1;
        for (n2 = t3.length - 1; n2 >= 0; --n2) {
          var f = t3.charCodeAt(n2);
          if (f === 47) {
            if (!a) {
              o = n2 + 1;
              break;
            }
          } else
            s === -1 && (a = false, s = n2 + 1), h >= 0 && (f === r3.charCodeAt(h) ? --h == -1 && (i = n2) : (h = -1, i = s));
        }
        return o === i ? i = s : i === -1 && (i = t3.length), t3.slice(o, i);
      }
      for (n2 = t3.length - 1; n2 >= 0; --n2)
        if (t3.charCodeAt(n2) === 47) {
          if (!a) {
            o = n2 + 1;
            break;
          }
        } else
          i === -1 && (a = false, i = n2 + 1);
      return i === -1 ? "" : t3.slice(o, i);
    }, extname: function(t3) {
      e2(t3);
      for (var r3 = -1, n2 = 0, o = -1, i = true, a = 0, h = t3.length - 1; h >= 0; --h) {
        var s = t3.charCodeAt(h);
        if (s !== 47)
          o === -1 && (i = false, o = h + 1), s === 46 ? r3 === -1 ? r3 = h : a !== 1 && (a = 1) : r3 !== -1 && (a = -1);
        else if (!i) {
          n2 = h + 1;
          break;
        }
      }
      return r3 === -1 || o === -1 || a === 0 || a === 1 && r3 === o - 1 && r3 === n2 + 1 ? "" : t3.slice(r3, o);
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
      for (var a = -1, h = 0, s = -1, f = true, u = t3.length - 1, c = 0; u >= n2; --u)
        if ((o = t3.charCodeAt(u)) !== 47)
          s === -1 && (f = false, s = u + 1), o === 46 ? a === -1 ? a = u : c !== 1 && (c = 1) : a !== -1 && (c = -1);
        else if (!f) {
          h = u + 1;
          break;
        }
      return a === -1 || s === -1 || c === 0 || c === 1 && a === s - 1 && a === h + 1 ? s !== -1 && (r3.base = r3.name = h === 0 && i ? t3.slice(1, s) : t3.slice(h, s)) : (h === 0 && i ? (r3.name = t3.slice(1, a), r3.base = t3.slice(1, s)) : (r3.name = t3.slice(h, a), r3.base = t3.slice(h, s)), r3.ext = t3.slice(a, s)), h > 0 ? r3.dir = t3.slice(0, h - 1) : i && (r3.dir = "/"), r3;
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
    var i, a, h = (i = function(t3, e3) {
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
    }), s = /^\w[\w\d+.-]*$/, f = /^\//, u = /^\/\//, c = "", l = "/", p = /^(([^:/?#]+?):)?(\/\/([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/, g = function() {
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
              if (!f.test(t5.path))
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
        return t4 === void 0 && (t4 = false), A(this, t4);
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
        return t4 === void 0 && (t4 = false), t4 ? A(this, true) : (this._formatted || (this._formatted = A(this, false)), this._formatted);
      }, e3.prototype.toJSON = function() {
        var t4 = { $mid: 1 };
        return this._fsPath && (t4.fsPath = this._fsPath, t4._sep = d), this._formatted && (t4.external = this._formatted), this.path && (t4.path = this.path), this.scheme && (t4.scheme = this.scheme), this.authority && (t4.authority = this.authority), this.query && (t4.query = this.query), this.fragment && (t4.fragment = this.fragment), t4;
      }, e3;
    }(g), m = ((a = {})[58] = "%3A", a[47] = "%2F", a[63] = "%3F", a[35] = "%23", a[91] = "%5B", a[93] = "%5D", a[64] = "%40", a[33] = "%21", a[36] = "%24", a[38] = "%26", a[39] = "%27", a[40] = "%28", a[41] = "%29", a[42] = "%2A", a[43] = "%2B", a[44] = "%2C", a[59] = "%3B", a[61] = "%3D", a[32] = "%20", a);
    function y(t3, e3) {
      for (var r3 = void 0, n2 = -1, o2 = 0; o2 < t3.length; o2++) {
        var i2 = t3.charCodeAt(o2);
        if (i2 >= 97 && i2 <= 122 || i2 >= 65 && i2 <= 90 || i2 >= 48 && i2 <= 57 || i2 === 45 || i2 === 46 || i2 === 95 || i2 === 126 || e3 && i2 === 47)
          n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2, o2)), n2 = -1), r3 !== void 0 && (r3 += t3.charAt(o2));
        else {
          r3 === void 0 && (r3 = t3.substr(0, o2));
          var a2 = m[i2];
          a2 !== void 0 ? (n2 !== -1 && (r3 += encodeURIComponent(t3.substring(n2, o2)), n2 = -1), r3 += a2) : n2 === -1 && (n2 = o2);
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
    function A(t3, e3) {
      var r3 = e3 ? b : y, n2 = "", o2 = t3.scheme, i2 = t3.authority, a2 = t3.path, h2 = t3.query, s2 = t3.fragment;
      if (o2 && (n2 += o2, n2 += ":"), (i2 || o2 === "file") && (n2 += l, n2 += l), i2) {
        var f2 = i2.indexOf("@");
        if (f2 !== -1) {
          var u2 = i2.substr(0, f2);
          i2 = i2.substr(f2 + 1), (f2 = u2.indexOf(":")) === -1 ? n2 += r3(u2, false) : (n2 += r3(u2.substr(0, f2), false), n2 += ":", n2 += r3(u2.substr(f2 + 1), false)), n2 += "@";
        }
        (f2 = (i2 = i2.toLowerCase()).indexOf(":")) === -1 ? n2 += r3(i2, false) : (n2 += r3(i2.substr(0, f2), false), n2 += i2.substr(f2));
      }
      if (a2) {
        if (a2.length >= 3 && a2.charCodeAt(0) === 47 && a2.charCodeAt(2) === 58)
          (c2 = a2.charCodeAt(1)) >= 65 && c2 <= 90 && (a2 = "/" + String.fromCharCode(c2 + 32) + ":" + a2.substr(3));
        else if (a2.length >= 2 && a2.charCodeAt(1) === 58) {
          var c2;
          (c2 = a2.charCodeAt(0)) >= 65 && c2 <= 90 && (a2 = String.fromCharCode(c2 + 32) + ":" + a2.substr(2));
        }
        n2 += r3(a2, true);
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
        for (var i2 = arguments[e3], a2 = 0, h2 = i2.length; a2 < h2; a2++, o2++)
          n2[o2] = i2[a2];
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
function createRegex(glob, opts) {
  if (typeof glob !== "string") {
    throw new TypeError("Expected a string");
  }
  var str = String(glob);
  var reStr = "";
  var extended = opts ? !!opts.extended : false;
  var globstar = opts ? !!opts.globstar : false;
  var inGroup = false;
  var flags = opts && typeof opts.flags === "string" ? opts.flags : "";
  var c;
  for (var i = 0, len = str.length; i < len; i++) {
    c = str[i];
    switch (c) {
      case "/":
      case "$":
      case "^":
      case "+":
      case ".":
      case "(":
      case ")":
      case "=":
      case "!":
      case "|":
        reStr += "\\" + c;
        break;
      case "?":
        if (extended) {
          reStr += ".";
          break;
        }
      case "[":
      case "]":
        if (extended) {
          reStr += c;
          break;
        }
      case "{":
        if (extended) {
          inGroup = true;
          reStr += "(";
          break;
        }
      case "}":
        if (extended) {
          inGroup = false;
          reStr += ")";
          break;
        }
      case ",":
        if (inGroup) {
          reStr += "|";
          break;
        }
        reStr += "\\" + c;
        break;
      case "*":
        var prevChar = str[i - 1];
        var starCount = 1;
        while (str[i + 1] === "*") {
          starCount++;
          i++;
        }
        var nextChar = str[i + 1];
        if (!globstar) {
          reStr += ".*";
        } else {
          var isGlobstar = starCount > 1 && (prevChar === "/" || prevChar === void 0 || prevChar === "{" || prevChar === ",") && (nextChar === "/" || nextChar === void 0 || nextChar === "," || nextChar === "}");
          if (isGlobstar) {
            if (nextChar === "/") {
              i++;
            } else if (prevChar === "/" && reStr.endsWith("\\/")) {
              reStr = reStr.substr(0, reStr.length - 2);
            }
            reStr += "((?:[^/]*(?:/|$))*)";
          } else {
            reStr += "([^/]*)";
          }
        }
        break;
      default:
        reStr += c;
    }
  }
  if (!flags || !~flags.indexOf("g")) {
    reStr = "^" + reStr + "$";
  }
  return new RegExp(reStr, flags);
}
var localize$1 = loadMessageBundle();
var BANG = "!";
var PATH_SEP = "/";
var FilePatternAssociation = function() {
  function FilePatternAssociation2(pattern, uris) {
    this.globWrappers = [];
    try {
      for (var _i = 0, pattern_1 = pattern; _i < pattern_1.length; _i++) {
        var patternString = pattern_1[_i];
        var include = patternString[0] !== BANG;
        if (!include) {
          patternString = patternString.substring(1);
        }
        if (patternString.length > 0) {
          if (patternString[0] === PATH_SEP) {
            patternString = patternString.substring(1);
          }
          this.globWrappers.push({
            regexp: createRegex("**/" + patternString, { extended: true, globstar: true }),
            include
          });
        }
      }
      ;
      this.uris = uris;
    } catch (e) {
      this.globWrappers.length = 0;
      this.uris = [];
    }
  }
  FilePatternAssociation2.prototype.matchesPattern = function(fileName) {
    var match = false;
    for (var _i = 0, _a = this.globWrappers; _i < _a.length; _i++) {
      var _b = _a[_i], regexp = _b.regexp, include = _b.include;
      if (regexp.test(fileName)) {
        match = include;
      }
    }
    return match;
  };
  FilePatternAssociation2.prototype.getURIs = function() {
    return this.uris;
  };
  return FilePatternAssociation2;
}();
var SchemaHandle = function() {
  function SchemaHandle2(service, url, unresolvedSchemaContent) {
    this.service = service;
    this.url = url;
    this.dependencies = {};
    if (unresolvedSchemaContent) {
      this.unresolvedSchema = this.service.promise.resolve(new UnresolvedSchema(unresolvedSchemaContent));
    }
  }
  SchemaHandle2.prototype.getUnresolvedSchema = function() {
    if (!this.unresolvedSchema) {
      this.unresolvedSchema = this.service.loadSchema(this.url);
    }
    return this.unresolvedSchema;
  };
  SchemaHandle2.prototype.getResolvedSchema = function() {
    var _this = this;
    if (!this.resolvedSchema) {
      this.resolvedSchema = this.getUnresolvedSchema().then(function(unresolved) {
        return _this.service.resolveSchemaContent(unresolved, _this.url, _this.dependencies);
      });
    }
    return this.resolvedSchema;
  };
  SchemaHandle2.prototype.clearSchema = function() {
    this.resolvedSchema = void 0;
    this.unresolvedSchema = void 0;
    this.dependencies = {};
  };
  return SchemaHandle2;
}();
var UnresolvedSchema = function() {
  function UnresolvedSchema2(schema, errors) {
    if (errors === void 0) {
      errors = [];
    }
    this.schema = schema;
    this.errors = errors;
  }
  return UnresolvedSchema2;
}();
var ResolvedSchema = function() {
  function ResolvedSchema2(schema, errors) {
    if (errors === void 0) {
      errors = [];
    }
    this.schema = schema;
    this.errors = errors;
  }
  ResolvedSchema2.prototype.getSection = function(path) {
    var schemaRef = this.getSectionRecursive(path, this.schema);
    if (schemaRef) {
      return asSchema(schemaRef);
    }
    return void 0;
  };
  ResolvedSchema2.prototype.getSectionRecursive = function(path, schema) {
    if (!schema || typeof schema === "boolean" || path.length === 0) {
      return schema;
    }
    var next = path.shift();
    if (schema.properties && typeof schema.properties[next]) {
      return this.getSectionRecursive(path, schema.properties[next]);
    } else if (schema.patternProperties) {
      for (var _i = 0, _a = Object.keys(schema.patternProperties); _i < _a.length; _i++) {
        var pattern = _a[_i];
        var regex = extendedRegExp(pattern);
        if (regex.test(next)) {
          return this.getSectionRecursive(path, schema.patternProperties[pattern]);
        }
      }
    } else if (typeof schema.additionalProperties === "object") {
      return this.getSectionRecursive(path, schema.additionalProperties);
    } else if (next.match("[0-9]+")) {
      if (Array.isArray(schema.items)) {
        var index = parseInt(next, 10);
        if (!isNaN(index) && schema.items[index]) {
          return this.getSectionRecursive(path, schema.items[index]);
        }
      } else if (schema.items) {
        return this.getSectionRecursive(path, schema.items);
      }
    }
    return void 0;
  };
  return ResolvedSchema2;
}();
(function() {
  function JSONSchemaService(requestService, contextService, promiseConstructor) {
    this.contextService = contextService;
    this.requestService = requestService;
    this.promiseConstructor = promiseConstructor || Promise;
    this.callOnDispose = [];
    this.contributionSchemas = {};
    this.contributionAssociations = [];
    this.schemasById = {};
    this.filePatternAssociations = [];
    this.registeredSchemasIds = {};
  }
  JSONSchemaService.prototype.getRegisteredSchemaIds = function(filter) {
    return Object.keys(this.registeredSchemasIds).filter(function(id) {
      var scheme = URI.parse(id).scheme;
      return scheme !== "schemaservice" && (!filter || filter(scheme));
    });
  };
  Object.defineProperty(JSONSchemaService.prototype, "promise", {
    get: function() {
      return this.promiseConstructor;
    },
    enumerable: false,
    configurable: true
  });
  JSONSchemaService.prototype.dispose = function() {
    while (this.callOnDispose.length > 0) {
      this.callOnDispose.pop()();
    }
  };
  JSONSchemaService.prototype.onResourceChange = function(uri) {
    var _this = this;
    var hasChanges = false;
    uri = normalizeId(uri);
    var toWalk = [uri];
    var all = Object.keys(this.schemasById).map(function(key) {
      return _this.schemasById[key];
    });
    while (toWalk.length) {
      var curr = toWalk.pop();
      for (var i = 0; i < all.length; i++) {
        var handle = all[i];
        if (handle && (handle.url === curr || handle.dependencies[curr])) {
          if (handle.url !== curr) {
            toWalk.push(handle.url);
          }
          handle.clearSchema();
          all[i] = void 0;
          hasChanges = true;
        }
      }
    }
    return hasChanges;
  };
  JSONSchemaService.prototype.setSchemaContributions = function(schemaContributions2) {
    if (schemaContributions2.schemas) {
      var schemas = schemaContributions2.schemas;
      for (var id in schemas) {
        var normalizedId = normalizeId(id);
        this.contributionSchemas[normalizedId] = this.addSchemaHandle(normalizedId, schemas[id]);
      }
    }
    if (Array.isArray(schemaContributions2.schemaAssociations)) {
      var schemaAssociations = schemaContributions2.schemaAssociations;
      for (var _i = 0, schemaAssociations_1 = schemaAssociations; _i < schemaAssociations_1.length; _i++) {
        var schemaAssociation = schemaAssociations_1[_i];
        var uris = schemaAssociation.uris.map(normalizeId);
        var association = this.addFilePatternAssociation(schemaAssociation.pattern, uris);
        this.contributionAssociations.push(association);
      }
    }
  };
  JSONSchemaService.prototype.addSchemaHandle = function(id, unresolvedSchemaContent) {
    var schemaHandle = new SchemaHandle(this, id, unresolvedSchemaContent);
    this.schemasById[id] = schemaHandle;
    return schemaHandle;
  };
  JSONSchemaService.prototype.getOrAddSchemaHandle = function(id, unresolvedSchemaContent) {
    return this.schemasById[id] || this.addSchemaHandle(id, unresolvedSchemaContent);
  };
  JSONSchemaService.prototype.addFilePatternAssociation = function(pattern, uris) {
    var fpa = new FilePatternAssociation(pattern, uris);
    this.filePatternAssociations.push(fpa);
    return fpa;
  };
  JSONSchemaService.prototype.registerExternalSchema = function(uri, filePatterns, unresolvedSchemaContent) {
    var id = normalizeId(uri);
    this.registeredSchemasIds[id] = true;
    this.cachedSchemaForResource = void 0;
    if (filePatterns) {
      this.addFilePatternAssociation(filePatterns, [uri]);
    }
    return unresolvedSchemaContent ? this.addSchemaHandle(id, unresolvedSchemaContent) : this.getOrAddSchemaHandle(id);
  };
  JSONSchemaService.prototype.clearExternalSchemas = function() {
    this.schemasById = {};
    this.filePatternAssociations = [];
    this.registeredSchemasIds = {};
    this.cachedSchemaForResource = void 0;
    for (var id in this.contributionSchemas) {
      this.schemasById[id] = this.contributionSchemas[id];
      this.registeredSchemasIds[id] = true;
    }
    for (var _i = 0, _a = this.contributionAssociations; _i < _a.length; _i++) {
      var contributionAssociation = _a[_i];
      this.filePatternAssociations.push(contributionAssociation);
    }
  };
  JSONSchemaService.prototype.getResolvedSchema = function(schemaId) {
    var id = normalizeId(schemaId);
    var schemaHandle = this.schemasById[id];
    if (schemaHandle) {
      return schemaHandle.getResolvedSchema();
    }
    return this.promise.resolve(void 0);
  };
  JSONSchemaService.prototype.loadSchema = function(url) {
    if (!this.requestService) {
      var errorMessage = localize$1("json.schema.norequestservice", "Unable to load schema from '{0}'. No schema request service available", toDisplayString(url));
      return this.promise.resolve(new UnresolvedSchema({}, [errorMessage]));
    }
    return this.requestService(url).then(function(content) {
      if (!content) {
        var errorMessage2 = localize$1("json.schema.nocontent", "Unable to load schema from '{0}': No content.", toDisplayString(url));
        return new UnresolvedSchema({}, [errorMessage2]);
      }
      var schemaContent = {};
      var jsonErrors = [];
      schemaContent = parse(content, jsonErrors);
      var errors = jsonErrors.length ? [localize$1("json.schema.invalidFormat", "Unable to parse content from '{0}': Parse error at offset {1}.", toDisplayString(url), jsonErrors[0].offset)] : [];
      return new UnresolvedSchema(schemaContent, errors);
    }, function(error) {
      var errorMessage2 = error.toString();
      var errorSplit = error.toString().split("Error: ");
      if (errorSplit.length > 1) {
        errorMessage2 = errorSplit[1];
      }
      if (endsWith(errorMessage2, ".")) {
        errorMessage2 = errorMessage2.substr(0, errorMessage2.length - 1);
      }
      return new UnresolvedSchema({}, [localize$1("json.schema.nocontent", "Unable to load schema from '{0}': {1}.", toDisplayString(url), errorMessage2)]);
    });
  };
  JSONSchemaService.prototype.resolveSchemaContent = function(schemaToResolve, schemaURL, dependencies) {
    var _this = this;
    var resolveErrors = schemaToResolve.errors.slice(0);
    var schema = schemaToResolve.schema;
    if (schema.$schema) {
      var id = normalizeId(schema.$schema);
      if (id === "http://json-schema.org/draft-03/schema") {
        return this.promise.resolve(new ResolvedSchema({}, [localize$1("json.schema.draft03.notsupported", "Draft-03 schemas are not supported.")]));
      } else if (id === "https://json-schema.org/draft/2019-09/schema") {
        resolveErrors.push(localize$1("json.schema.draft201909.notsupported", "Draft 2019-09 schemas are not yet fully supported."));
      }
    }
    var contextService = this.contextService;
    var findSection = function(schema2, path) {
      if (!path) {
        return schema2;
      }
      var current = schema2;
      if (path[0] === "/") {
        path = path.substr(1);
      }
      path.split("/").some(function(part) {
        part = part.replace(/~1/g, "/").replace(/~0/g, "~");
        current = current[part];
        return !current;
      });
      return current;
    };
    var merge = function(target, sourceRoot, sourceURI, refSegment) {
      var path = refSegment ? decodeURIComponent(refSegment) : void 0;
      var section = findSection(sourceRoot, path);
      if (section) {
        for (var key in section) {
          if (section.hasOwnProperty(key) && !target.hasOwnProperty(key)) {
            target[key] = section[key];
          }
        }
      } else {
        resolveErrors.push(localize$1("json.schema.invalidref", "$ref '{0}' in '{1}' can not be resolved.", path, sourceURI));
      }
    };
    var resolveExternalLink = function(node, uri, refSegment, parentSchemaURL, parentSchemaDependencies) {
      if (contextService && !/^[A-Za-z][A-Za-z0-9+\-.+]*:\/\/.*/.test(uri)) {
        uri = contextService.resolveRelativePath(uri, parentSchemaURL);
      }
      uri = normalizeId(uri);
      var referencedHandle = _this.getOrAddSchemaHandle(uri);
      return referencedHandle.getUnresolvedSchema().then(function(unresolvedSchema) {
        parentSchemaDependencies[uri] = true;
        if (unresolvedSchema.errors.length) {
          var loc = refSegment ? uri + "#" + refSegment : uri;
          resolveErrors.push(localize$1("json.schema.problemloadingref", "Problems loading reference '{0}': {1}", loc, unresolvedSchema.errors[0]));
        }
        merge(node, unresolvedSchema.schema, uri, refSegment);
        return resolveRefs(node, unresolvedSchema.schema, uri, referencedHandle.dependencies);
      });
    };
    var resolveRefs = function(node, parentSchema, parentSchemaURL, parentSchemaDependencies) {
      if (!node || typeof node !== "object") {
        return Promise.resolve(null);
      }
      var toWalk = [node];
      var seen = [];
      var openPromises = [];
      var collectEntries = function() {
        var entries = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          entries[_i] = arguments[_i];
        }
        for (var _a = 0, entries_1 = entries; _a < entries_1.length; _a++) {
          var entry = entries_1[_a];
          if (typeof entry === "object") {
            toWalk.push(entry);
          }
        }
      };
      var collectMapEntries = function() {
        var maps = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          maps[_i] = arguments[_i];
        }
        for (var _a = 0, maps_1 = maps; _a < maps_1.length; _a++) {
          var map = maps_1[_a];
          if (typeof map === "object") {
            for (var k in map) {
              var key = k;
              var entry = map[key];
              if (typeof entry === "object") {
                toWalk.push(entry);
              }
            }
          }
        }
      };
      var collectArrayEntries = function() {
        var arrays = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          arrays[_i] = arguments[_i];
        }
        for (var _a = 0, arrays_1 = arrays; _a < arrays_1.length; _a++) {
          var array = arrays_1[_a];
          if (Array.isArray(array)) {
            for (var _b = 0, array_1 = array; _b < array_1.length; _b++) {
              var entry = array_1[_b];
              if (typeof entry === "object") {
                toWalk.push(entry);
              }
            }
          }
        }
      };
      var handleRef = function(next2) {
        var seenRefs = [];
        while (next2.$ref) {
          var ref = next2.$ref;
          var segments = ref.split("#", 2);
          delete next2.$ref;
          if (segments[0].length > 0) {
            openPromises.push(resolveExternalLink(next2, segments[0], segments[1], parentSchemaURL, parentSchemaDependencies));
            return;
          } else {
            if (seenRefs.indexOf(ref) === -1) {
              merge(next2, parentSchema, parentSchemaURL, segments[1]);
              seenRefs.push(ref);
            }
          }
        }
        collectEntries(next2.items, next2.additionalItems, next2.additionalProperties, next2.not, next2.contains, next2.propertyNames, next2.if, next2.then, next2.else);
        collectMapEntries(next2.definitions, next2.properties, next2.patternProperties, next2.dependencies);
        collectArrayEntries(next2.anyOf, next2.allOf, next2.oneOf, next2.items);
      };
      while (toWalk.length) {
        var next = toWalk.pop();
        if (seen.indexOf(next) >= 0) {
          continue;
        }
        seen.push(next);
        handleRef(next);
      }
      return _this.promise.all(openPromises);
    };
    return resolveRefs(schema, schema, schemaURL, dependencies).then(function(_) {
      return new ResolvedSchema(schema, resolveErrors);
    });
  };
  JSONSchemaService.prototype.getSchemaForResource = function(resource, document) {
    if (document && document.root && document.root.type === "object") {
      var schemaProperties = document.root.properties.filter(function(p) {
        return p.keyNode.value === "$schema" && p.valueNode && p.valueNode.type === "string";
      });
      if (schemaProperties.length > 0) {
        var valueNode = schemaProperties[0].valueNode;
        if (valueNode && valueNode.type === "string") {
          var schemeId = getNodeValue(valueNode);
          if (schemeId && startsWith(schemeId, ".") && this.contextService) {
            schemeId = this.contextService.resolveRelativePath(schemeId, resource);
          }
          if (schemeId) {
            var id = normalizeId(schemeId);
            return this.getOrAddSchemaHandle(id).getResolvedSchema();
          }
        }
      }
    }
    if (this.cachedSchemaForResource && this.cachedSchemaForResource.resource === resource) {
      return this.cachedSchemaForResource.resolvedSchema;
    }
    var seen = Object.create(null);
    var schemas = [];
    var normalizedResource = normalizeResourceForMatching(resource);
    for (var _i = 0, _a = this.filePatternAssociations; _i < _a.length; _i++) {
      var entry = _a[_i];
      if (entry.matchesPattern(normalizedResource)) {
        for (var _b = 0, _c = entry.getURIs(); _b < _c.length; _b++) {
          var schemaId = _c[_b];
          if (!seen[schemaId]) {
            schemas.push(schemaId);
            seen[schemaId] = true;
          }
        }
      }
    }
    var resolvedSchema = schemas.length > 0 ? this.createCombinedSchema(resource, schemas).getResolvedSchema() : this.promise.resolve(void 0);
    this.cachedSchemaForResource = { resource, resolvedSchema };
    return resolvedSchema;
  };
  JSONSchemaService.prototype.createCombinedSchema = function(resource, schemaIds) {
    if (schemaIds.length === 1) {
      return this.getOrAddSchemaHandle(schemaIds[0]);
    } else {
      var combinedSchemaId = "schemaservice://combinedSchema/" + encodeURIComponent(resource);
      var combinedSchema = {
        allOf: schemaIds.map(function(schemaId) {
          return { $ref: schemaId };
        })
      };
      return this.addSchemaHandle(combinedSchemaId, combinedSchema);
    }
  };
  JSONSchemaService.prototype.getMatchingSchemas = function(document, jsonDocument, schema) {
    if (schema) {
      var id = schema.id || "schemaservice://untitled/matchingSchemas/" + idCounter++;
      return this.resolveSchemaContent(new UnresolvedSchema(schema), id, {}).then(function(resolvedSchema) {
        return jsonDocument.getMatchingSchemas(resolvedSchema.schema).filter(function(s) {
          return !s.inverted;
        });
      });
    }
    return this.getSchemaForResource(document.uri, jsonDocument).then(function(schema2) {
      if (schema2) {
        return jsonDocument.getMatchingSchemas(schema2.schema).filter(function(s) {
          return !s.inverted;
        });
      }
      return [];
    });
  };
  return JSONSchemaService;
})();
var idCounter = 0;
function normalizeId(id) {
  try {
    return URI.parse(id).toString();
  } catch (e) {
    return id;
  }
}
function normalizeResourceForMatching(resource) {
  try {
    return URI.parse(resource).with({ fragment: null, query: null }).toString();
  } catch (e) {
    return resource;
  }
}
function toDisplayString(url) {
  try {
    var uri = URI.parse(url);
    if (uri.scheme === "file") {
      return uri.fsPath;
    }
  } catch (e) {
  }
  return url;
}
var localize = loadMessageBundle();
var schemaContributions = {
  schemaAssociations: [],
  schemas: {
    "http://json-schema.org/schema#": {
      $ref: "http://json-schema.org/draft-07/schema#"
    },
    "http://json-schema.org/draft-04/schema#": {
      "title": localize("schema.json", "Describes a JSON file using a schema. See json-schema.org for more info."),
      "$schema": "http://json-schema.org/draft-04/schema#",
      "definitions": {
        "schemaArray": {
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#"
          }
        },
        "positiveInteger": {
          "type": "integer",
          "minimum": 0
        },
        "positiveIntegerDefault0": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveInteger"
            },
            {
              "default": 0
            }
          ]
        },
        "simpleTypes": {
          "type": "string",
          "enum": [
            "array",
            "boolean",
            "integer",
            "null",
            "number",
            "object",
            "string"
          ]
        },
        "stringArray": {
          "type": "array",
          "items": {
            "type": "string"
          },
          "minItems": 1,
          "uniqueItems": true
        }
      },
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "format": "uri"
        },
        "$schema": {
          "type": "string",
          "format": "uri"
        },
        "title": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "default": {},
        "multipleOf": {
          "type": "number",
          "minimum": 0,
          "exclusiveMinimum": true
        },
        "maximum": {
          "type": "number"
        },
        "exclusiveMaximum": {
          "type": "boolean",
          "default": false
        },
        "minimum": {
          "type": "number"
        },
        "exclusiveMinimum": {
          "type": "boolean",
          "default": false
        },
        "maxLength": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveInteger"
            }
          ]
        },
        "minLength": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveIntegerDefault0"
            }
          ]
        },
        "pattern": {
          "type": "string",
          "format": "regex"
        },
        "additionalItems": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#"
            }
          ],
          "default": {}
        },
        "items": {
          "anyOf": [
            {
              "$ref": "#"
            },
            {
              "$ref": "#/definitions/schemaArray"
            }
          ],
          "default": {}
        },
        "maxItems": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveInteger"
            }
          ]
        },
        "minItems": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveIntegerDefault0"
            }
          ]
        },
        "uniqueItems": {
          "type": "boolean",
          "default": false
        },
        "maxProperties": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveInteger"
            }
          ]
        },
        "minProperties": {
          "allOf": [
            {
              "$ref": "#/definitions/positiveIntegerDefault0"
            }
          ]
        },
        "required": {
          "allOf": [
            {
              "$ref": "#/definitions/stringArray"
            }
          ]
        },
        "additionalProperties": {
          "anyOf": [
            {
              "type": "boolean"
            },
            {
              "$ref": "#"
            }
          ],
          "default": {}
        },
        "definitions": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#"
          },
          "default": {}
        },
        "properties": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#"
          },
          "default": {}
        },
        "patternProperties": {
          "type": "object",
          "additionalProperties": {
            "$ref": "#"
          },
          "default": {}
        },
        "dependencies": {
          "type": "object",
          "additionalProperties": {
            "anyOf": [
              {
                "$ref": "#"
              },
              {
                "$ref": "#/definitions/stringArray"
              }
            ]
          }
        },
        "enum": {
          "type": "array",
          "minItems": 1,
          "uniqueItems": true
        },
        "type": {
          "anyOf": [
            {
              "$ref": "#/definitions/simpleTypes"
            },
            {
              "type": "array",
              "items": {
                "$ref": "#/definitions/simpleTypes"
              },
              "minItems": 1,
              "uniqueItems": true
            }
          ]
        },
        "format": {
          "anyOf": [
            {
              "type": "string",
              "enum": [
                "date-time",
                "uri",
                "email",
                "hostname",
                "ipv4",
                "ipv6",
                "regex"
              ]
            },
            {
              "type": "string"
            }
          ]
        },
        "allOf": {
          "allOf": [
            {
              "$ref": "#/definitions/schemaArray"
            }
          ]
        },
        "anyOf": {
          "allOf": [
            {
              "$ref": "#/definitions/schemaArray"
            }
          ]
        },
        "oneOf": {
          "allOf": [
            {
              "$ref": "#/definitions/schemaArray"
            }
          ]
        },
        "not": {
          "allOf": [
            {
              "$ref": "#"
            }
          ]
        }
      },
      "dependencies": {
        "exclusiveMaximum": [
          "maximum"
        ],
        "exclusiveMinimum": [
          "minimum"
        ]
      },
      "default": {}
    },
    "http://json-schema.org/draft-07/schema#": {
      "title": localize("schema.json", "Describes a JSON file using a schema. See json-schema.org for more info."),
      "definitions": {
        "schemaArray": {
          "type": "array",
          "minItems": 1,
          "items": { "$ref": "#" }
        },
        "nonNegativeInteger": {
          "type": "integer",
          "minimum": 0
        },
        "nonNegativeIntegerDefault0": {
          "allOf": [
            { "$ref": "#/definitions/nonNegativeInteger" },
            { "default": 0 }
          ]
        },
        "simpleTypes": {
          "enum": [
            "array",
            "boolean",
            "integer",
            "null",
            "number",
            "object",
            "string"
          ]
        },
        "stringArray": {
          "type": "array",
          "items": { "type": "string" },
          "uniqueItems": true,
          "default": []
        }
      },
      "type": ["object", "boolean"],
      "properties": {
        "$id": {
          "type": "string",
          "format": "uri-reference"
        },
        "$schema": {
          "type": "string",
          "format": "uri"
        },
        "$ref": {
          "type": "string",
          "format": "uri-reference"
        },
        "$comment": {
          "type": "string"
        },
        "title": {
          "type": "string"
        },
        "description": {
          "type": "string"
        },
        "default": true,
        "readOnly": {
          "type": "boolean",
          "default": false
        },
        "examples": {
          "type": "array",
          "items": true
        },
        "multipleOf": {
          "type": "number",
          "exclusiveMinimum": 0
        },
        "maximum": {
          "type": "number"
        },
        "exclusiveMaximum": {
          "type": "number"
        },
        "minimum": {
          "type": "number"
        },
        "exclusiveMinimum": {
          "type": "number"
        },
        "maxLength": { "$ref": "#/definitions/nonNegativeInteger" },
        "minLength": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "pattern": {
          "type": "string",
          "format": "regex"
        },
        "additionalItems": { "$ref": "#" },
        "items": {
          "anyOf": [
            { "$ref": "#" },
            { "$ref": "#/definitions/schemaArray" }
          ],
          "default": true
        },
        "maxItems": { "$ref": "#/definitions/nonNegativeInteger" },
        "minItems": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "uniqueItems": {
          "type": "boolean",
          "default": false
        },
        "contains": { "$ref": "#" },
        "maxProperties": { "$ref": "#/definitions/nonNegativeInteger" },
        "minProperties": { "$ref": "#/definitions/nonNegativeIntegerDefault0" },
        "required": { "$ref": "#/definitions/stringArray" },
        "additionalProperties": { "$ref": "#" },
        "definitions": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": {}
        },
        "properties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "default": {}
        },
        "patternProperties": {
          "type": "object",
          "additionalProperties": { "$ref": "#" },
          "propertyNames": { "format": "regex" },
          "default": {}
        },
        "dependencies": {
          "type": "object",
          "additionalProperties": {
            "anyOf": [
              { "$ref": "#" },
              { "$ref": "#/definitions/stringArray" }
            ]
          }
        },
        "propertyNames": { "$ref": "#" },
        "const": true,
        "enum": {
          "type": "array",
          "items": true,
          "minItems": 1,
          "uniqueItems": true
        },
        "type": {
          "anyOf": [
            { "$ref": "#/definitions/simpleTypes" },
            {
              "type": "array",
              "items": { "$ref": "#/definitions/simpleTypes" },
              "minItems": 1,
              "uniqueItems": true
            }
          ]
        },
        "format": { "type": "string" },
        "contentMediaType": { "type": "string" },
        "contentEncoding": { "type": "string" },
        "if": { "$ref": "#" },
        "then": { "$ref": "#" },
        "else": { "$ref": "#" },
        "allOf": { "$ref": "#/definitions/schemaArray" },
        "anyOf": { "$ref": "#/definitions/schemaArray" },
        "oneOf": { "$ref": "#/definitions/schemaArray" },
        "not": { "$ref": "#" }
      },
      "default": true
    }
  }
};
var descriptions = {
  id: localize("schema.json.id", "A unique identifier for the schema."),
  $schema: localize("schema.json.$schema", "The schema to verify this document against."),
  title: localize("schema.json.title", "A descriptive title of the element."),
  description: localize("schema.json.description", "A long description of the element. Used in hover menus and suggestions."),
  default: localize("schema.json.default", "A default value. Used by suggestions."),
  multipleOf: localize("schema.json.multipleOf", "A number that should cleanly divide the current value (i.e. have no remainder)."),
  maximum: localize("schema.json.maximum", "The maximum numerical value, inclusive by default."),
  exclusiveMaximum: localize("schema.json.exclusiveMaximum", "Makes the maximum property exclusive."),
  minimum: localize("schema.json.minimum", "The minimum numerical value, inclusive by default."),
  exclusiveMinimum: localize("schema.json.exclusiveMininum", "Makes the minimum property exclusive."),
  maxLength: localize("schema.json.maxLength", "The maximum length of a string."),
  minLength: localize("schema.json.minLength", "The minimum length of a string."),
  pattern: localize("schema.json.pattern", "A regular expression to match the string against. It is not implicitly anchored."),
  additionalItems: localize("schema.json.additionalItems", "For arrays, only when items is set as an array. If it is a schema, then this schema validates items after the ones specified by the items array. If it is false, then additional items will cause validation to fail."),
  items: localize("schema.json.items", "For arrays. Can either be a schema to validate every element against or an array of schemas to validate each item against in order (the first schema will validate the first element, the second schema will validate the second element, and so on."),
  maxItems: localize("schema.json.maxItems", "The maximum number of items that can be inside an array. Inclusive."),
  minItems: localize("schema.json.minItems", "The minimum number of items that can be inside an array. Inclusive."),
  uniqueItems: localize("schema.json.uniqueItems", "If all of the items in the array must be unique. Defaults to false."),
  maxProperties: localize("schema.json.maxProperties", "The maximum number of properties an object can have. Inclusive."),
  minProperties: localize("schema.json.minProperties", "The minimum number of properties an object can have. Inclusive."),
  required: localize("schema.json.required", "An array of strings that lists the names of all properties required on this object."),
  additionalProperties: localize("schema.json.additionalProperties", "Either a schema or a boolean. If a schema, then used to validate all properties not matched by 'properties' or 'patternProperties'. If false, then any properties not matched by either will cause this schema to fail."),
  definitions: localize("schema.json.definitions", "Not used for validation. Place subschemas here that you wish to reference inline with $ref."),
  properties: localize("schema.json.properties", "A map of property names to schemas for each property."),
  patternProperties: localize("schema.json.patternProperties", "A map of regular expressions on property names to schemas for matching properties."),
  dependencies: localize("schema.json.dependencies", "A map of property names to either an array of property names or a schema. An array of property names means the property named in the key depends on the properties in the array being present in the object in order to be valid. If the value is a schema, then the schema is only applied to the object if the property in the key exists on the object."),
  enum: localize("schema.json.enum", "The set of literal values that are valid."),
  type: localize("schema.json.type", "Either a string of one of the basic schema types (number, integer, null, array, object, boolean, string) or an array of strings specifying a subset of those types."),
  format: localize("schema.json.format", "Describes the format expected for the value."),
  allOf: localize("schema.json.allOf", "An array of schemas, all of which must match."),
  anyOf: localize("schema.json.anyOf", "An array of schemas, where at least one must match."),
  oneOf: localize("schema.json.oneOf", "An array of schemas, exactly one of which must match."),
  not: localize("schema.json.not", "A schema which must not match."),
  $id: localize("schema.json.$id", "A unique identifier for the schema."),
  $ref: localize("schema.json.$ref", "Reference a definition hosted on any location."),
  $comment: localize("schema.json.$comment", "Comments from schema authors to readers or maintainers of the schema."),
  readOnly: localize("schema.json.readOnly", "Indicates that the value of the instance is managed exclusively by the owning authority."),
  examples: localize("schema.json.examples", "Sample JSON values associated with a particular schema, for the purpose of illustrating usage."),
  contains: localize("schema.json.contains", 'An array instance is valid against "contains" if at least one of its elements is valid against the given schema.'),
  propertyNames: localize("schema.json.propertyNames", "If the instance is an object, this keyword validates if every property name in the instance validates against the provided schema."),
  const: localize("schema.json.const", "An instance validates successfully against this keyword if its value is equal to the value of the keyword."),
  contentMediaType: localize("schema.json.contentMediaType", "Describes the media type of a string property."),
  contentEncoding: localize("schema.json.contentEncoding", "Describes the content encoding of a string property."),
  if: localize("schema.json.if", 'The validation outcome of the "if" subschema controls which of the "then" or "else" keywords are evaluated.'),
  then: localize("schema.json.then", 'The "if" subschema is used for validation when the "if" subschema succeeds.'),
  else: localize("schema.json.else", 'The "else" subschema is used for validation when the "if" subschema fails.')
};
for (var schemaName in schemaContributions.schemas) {
  var schema = schemaContributions.schemas[schemaName];
  for (var property in schema.properties) {
    var propertyObject = schema.properties[property];
    if (typeof propertyObject === "boolean") {
      propertyObject = schema.properties[property] = {};
    }
    var description = descriptions[property];
    if (description) {
      propertyObject["description"] = description;
    } else {
      console.log(property + ": localize('schema.json." + property + `', "")`);
    }
  }
}
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
        clearTimeout(handle);
        handle = setTimeout(function() {
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
    this._disposables.push(editor.onWillDisposeModel(function(model) {
      onModelRemoved(model);
      _this._resetSchema(model.uri);
    }));
    this._disposables.push(editor.onDidChangeModelLanguage(function(event) {
      onModelRemoved(event.model);
      onModelAdd(event.model);
      _this._resetSchema(event.model.uri);
    }));
    this._disposables.push(defaults.onDidChange(function(_) {
      editor.getModels().forEach(function(model) {
        if (model.getModeId() === _this._languageId) {
          onModelRemoved(model);
          onModelAdd(model);
        }
      });
    }));
    this._disposables.push({
      dispose: function() {
        editor.getModels().forEach(onModelRemoved);
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
  DiagnosticsAdapter2.prototype._resetSchema = function(resource) {
    this._worker().then(function(worker) {
      worker.resetSchema(resource.toString());
    });
  };
  DiagnosticsAdapter2.prototype._doValidate = function(resource, languageId) {
    this._worker(resource).then(function(worker) {
      return worker.doValidation(resource.toString()).then(function(diagnostics) {
        var markers = diagnostics.map(function(d) {
          return toDiagnostics(resource, d);
        });
        var model = editor.getModel(resource);
        if (model && model.getModeId() === languageId) {
          editor.setModelMarkers(model, languageId, markers);
        }
      });
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
      return [" ", ":", '"'];
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
          range: toRange(item.location.range),
          selectionRange: toRange(item.location.range),
          tags: []
        };
      });
    });
  };
  return DocumentSymbolAdapter2;
}();
function fromFormattingOptions(options) {
  return {
    tabSize: options.tabSize,
    insertSpaces: options.insertSpaces
  };
}
var DocumentFormattingEditProvider = function() {
  function DocumentFormattingEditProvider2(_worker) {
    this._worker = _worker;
  }
  DocumentFormattingEditProvider2.prototype.provideDocumentFormattingEdits = function(model, options, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.format(resource.toString(), null, fromFormattingOptions(options)).then(function(edits) {
        if (!edits || edits.length === 0) {
          return;
        }
        return edits.map(toTextEdit);
      });
    });
  };
  return DocumentFormattingEditProvider2;
}();
var DocumentRangeFormattingEditProvider = function() {
  function DocumentRangeFormattingEditProvider2(_worker) {
    this._worker = _worker;
  }
  DocumentRangeFormattingEditProvider2.prototype.provideDocumentRangeFormattingEdits = function(model, range, options, token) {
    var resource = model.uri;
    return this._worker(resource).then(function(worker) {
      return worker.format(resource.toString(), fromRange(range), fromFormattingOptions(options)).then(function(edits) {
        if (!edits || edits.length === 0) {
          return;
        }
        return edits.map(toTextEdit);
      });
    });
  };
  return DocumentRangeFormattingEditProvider2;
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
  return void 0;
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
function createTokenizationSupport(supportComments) {
  return {
    getInitialState: function() {
      return new JSONState(null, null, false, null);
    },
    tokenize: function(line, state, offsetDelta, stopAtOffset) {
      return tokenize(supportComments, line, state, offsetDelta);
    }
  };
}
var TOKEN_DELIM_OBJECT = "delimiter.bracket.json";
var TOKEN_DELIM_ARRAY = "delimiter.array.json";
var TOKEN_DELIM_COLON = "delimiter.colon.json";
var TOKEN_DELIM_COMMA = "delimiter.comma.json";
var TOKEN_VALUE_BOOLEAN = "keyword.json";
var TOKEN_VALUE_NULL = "keyword.json";
var TOKEN_VALUE_STRING = "string.value.json";
var TOKEN_VALUE_NUMBER = "number.json";
var TOKEN_PROPERTY_NAME = "string.key.json";
var TOKEN_COMMENT_BLOCK = "comment.block.json";
var TOKEN_COMMENT_LINE = "comment.line.json";
var ParentsStack = function() {
  function ParentsStack2(parent, type) {
    this.parent = parent;
    this.type = type;
  }
  ParentsStack2.pop = function(parents) {
    if (parents) {
      return parents.parent;
    }
    return null;
  };
  ParentsStack2.push = function(parents, type) {
    return new ParentsStack2(parents, type);
  };
  ParentsStack2.equals = function(a, b) {
    if (!a && !b) {
      return true;
    }
    if (!a || !b) {
      return false;
    }
    while (a && b) {
      if (a === b) {
        return true;
      }
      if (a.type !== b.type) {
        return false;
      }
      a = a.parent;
      b = b.parent;
    }
    return true;
  };
  return ParentsStack2;
}();
var JSONState = function() {
  function JSONState2(state, scanError, lastWasColon, parents) {
    this._state = state;
    this.scanError = scanError;
    this.lastWasColon = lastWasColon;
    this.parents = parents;
  }
  JSONState2.prototype.clone = function() {
    return new JSONState2(this._state, this.scanError, this.lastWasColon, this.parents);
  };
  JSONState2.prototype.equals = function(other) {
    if (other === this) {
      return true;
    }
    if (!other || !(other instanceof JSONState2)) {
      return false;
    }
    return this.scanError === other.scanError && this.lastWasColon === other.lastWasColon && ParentsStack.equals(this.parents, other.parents);
  };
  JSONState2.prototype.getStateData = function() {
    return this._state;
  };
  JSONState2.prototype.setStateData = function(state) {
    this._state = state;
  };
  return JSONState2;
}();
function tokenize(comments, line, state, offsetDelta, stopAtOffset) {
  if (offsetDelta === void 0) {
    offsetDelta = 0;
  }
  var numberOfInsertedCharacters = 0;
  var adjustOffset = false;
  switch (state.scanError) {
    case 2:
      line = '"' + line;
      numberOfInsertedCharacters = 1;
      break;
    case 1:
      line = "/*" + line;
      numberOfInsertedCharacters = 2;
      break;
  }
  var scanner = createScanner(line);
  var lastWasColon = state.lastWasColon;
  var parents = state.parents;
  var ret = {
    tokens: [],
    endState: state.clone()
  };
  while (true) {
    var offset = offsetDelta + scanner.getPosition();
    var type = "";
    var kind = scanner.scan();
    if (kind === 17) {
      break;
    }
    if (offset === offsetDelta + scanner.getPosition()) {
      throw new Error("Scanner did not advance, next 3 characters are: " + line.substr(scanner.getPosition(), 3));
    }
    if (adjustOffset) {
      offset -= numberOfInsertedCharacters;
    }
    adjustOffset = numberOfInsertedCharacters > 0;
    switch (kind) {
      case 1:
        parents = ParentsStack.push(parents, 0);
        type = TOKEN_DELIM_OBJECT;
        lastWasColon = false;
        break;
      case 2:
        parents = ParentsStack.pop(parents);
        type = TOKEN_DELIM_OBJECT;
        lastWasColon = false;
        break;
      case 3:
        parents = ParentsStack.push(parents, 1);
        type = TOKEN_DELIM_ARRAY;
        lastWasColon = false;
        break;
      case 4:
        parents = ParentsStack.pop(parents);
        type = TOKEN_DELIM_ARRAY;
        lastWasColon = false;
        break;
      case 6:
        type = TOKEN_DELIM_COLON;
        lastWasColon = true;
        break;
      case 5:
        type = TOKEN_DELIM_COMMA;
        lastWasColon = false;
        break;
      case 8:
      case 9:
        type = TOKEN_VALUE_BOOLEAN;
        lastWasColon = false;
        break;
      case 7:
        type = TOKEN_VALUE_NULL;
        lastWasColon = false;
        break;
      case 10:
        var currentParent = parents ? parents.type : 0;
        var inArray = currentParent === 1;
        type = lastWasColon || inArray ? TOKEN_VALUE_STRING : TOKEN_PROPERTY_NAME;
        lastWasColon = false;
        break;
      case 11:
        type = TOKEN_VALUE_NUMBER;
        lastWasColon = false;
        break;
    }
    if (comments) {
      switch (kind) {
        case 12:
          type = TOKEN_COMMENT_LINE;
          break;
        case 13:
          type = TOKEN_COMMENT_BLOCK;
          break;
      }
    }
    ret.endState = new JSONState(state.getStateData(), scanner.getTokenError(), lastWasColon, parents);
    ret.tokens.push({
      startIndex: offset,
      scopes: type
    });
  }
  return ret;
}
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
    var languageId = defaults.languageId, modeConfiguration2 = defaults.modeConfiguration;
    disposeAll(providers);
    if (modeConfiguration2.documentFormattingEdits) {
      providers.push(languages.registerDocumentFormattingEditProvider(languageId, new DocumentFormattingEditProvider(worker)));
    }
    if (modeConfiguration2.documentRangeFormattingEdits) {
      providers.push(languages.registerDocumentRangeFormattingEditProvider(languageId, new DocumentRangeFormattingEditProvider(worker)));
    }
    if (modeConfiguration2.completionItems) {
      providers.push(languages.registerCompletionItemProvider(languageId, new CompletionAdapter(worker)));
    }
    if (modeConfiguration2.hovers) {
      providers.push(languages.registerHoverProvider(languageId, new HoverAdapter(worker)));
    }
    if (modeConfiguration2.documentSymbols) {
      providers.push(languages.registerDocumentSymbolProvider(languageId, new DocumentSymbolAdapter(worker)));
    }
    if (modeConfiguration2.tokens) {
      providers.push(languages.setTokensProvider(languageId, createTokenizationSupport(true)));
    }
    if (modeConfiguration2.colors) {
      providers.push(languages.registerColorProvider(languageId, new DocumentColorAdapter(worker)));
    }
    if (modeConfiguration2.foldingRanges) {
      providers.push(languages.registerFoldingRangeProvider(languageId, new FoldingRangeAdapter(worker)));
    }
    if (modeConfiguration2.diagnostics) {
      providers.push(new DiagnosticsAdapter(languageId, worker, defaults));
    }
    if (modeConfiguration2.selectionRanges) {
      providers.push(languages.registerSelectionRangeProvider(languageId, new SelectionRangeAdapter(worker)));
    }
  }
  registerProviders();
  disposables.push(languages.setLanguageConfiguration(defaults.languageId, richEditConfiguration));
  var modeConfiguration = defaults.modeConfiguration;
  defaults.onDidChange(function(newDefaults) {
    if (newDefaults.modeConfiguration !== modeConfiguration) {
      modeConfiguration = newDefaults.modeConfiguration;
      registerProviders();
    }
  });
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
var richEditConfiguration = {
  wordPattern: /(-?\d*\.\d\w*)|([^\[\{\]\}\:\"\,\s]+)/g,
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"]
  },
  brackets: [
    ["{", "}"],
    ["[", "]"]
  ],
  autoClosingPairs: [
    { open: "{", close: "}", notIn: ["string"] },
    { open: "[", close: "]", notIn: ["string"] },
    { open: '"', close: '"', notIn: ["string"] }
  ]
};
export { setupMode };
