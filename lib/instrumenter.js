"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Instrumenter = void 0;

var _istanbul = _interopRequireDefault(require("istanbul"));

var _core = require("@babel/core");

var _esprima = require("esprima");

var _escodegen = _interopRequireDefault(require("escodegen"));

var _sourceMap = require("source-map");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var POSITIONS = ['start', 'end'];

var Instrumenter =
/*#__PURE__*/
function (_istanbul$Instrumente) {
  _inherits(Instrumenter, _istanbul$Instrumente);

  function Instrumenter() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, Instrumenter);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Instrumenter).call(this));

    _istanbul["default"].Instrumenter.call(_assertThisInitialized(_this), options);

    _this.babelOptions = _objectSpread({
      sourceMap: true
    }, options && options.babel || {});
    return _this;
  }

  _createClass(Instrumenter, [{
    key: "instrumentSync",
    value: function instrumentSync(code, fileName) {
      var result = this._r = (0, _core.transform)(code, _objectSpread({}, this.babelOptions, {
        filename: fileName
      }));
      this._babelMap = new _sourceMap.SourceMapConsumer(result.map); // PARSE

      var program = (0, _esprima.parse)(result.code, {
        loc: true,
        range: true,
        tokens: this.opts.preserveComments,
        comment: true
      });

      if (this.opts.preserveComments) {
        program = _escodegen["default"].attachComments(program, program.comments, program.tokens);
      }

      return this.instrumentASTSync(program, fileName, code);
    }
  }, {
    key: "getPreamble",
    value: function getPreamble(sourceCode, emitUseStrict) {
      var _this2 = this;

      [['s', 'statementMap'], ['f', 'fnMap'], ['b', 'branchMap']].forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            metricName = _ref2[0],
            metricMapName = _ref2[1];

        var _ref3 = [_this2.coverState[metricName], _this2.coverState[metricMapName]],
            metrics = _ref3[0],
            metricMap = _ref3[1];
        var transformFctName = "_".concat(metricMapName, "Transformer");

        var transformedMetricMap = _this2[transformFctName](metricMap, metrics);

        _this2.coverState[metricMapName] = transformedMetricMap;
      });
      return _get(_getPrototypeOf(Instrumenter.prototype), "getPreamble", this).call(this, sourceCode, emitUseStrict);
    } ////

  }, {
    key: "_statementMapTransformer",
    value: function _statementMapTransformer(metrics) {
      var _this3 = this;

      return Object.keys(metrics).map(function (index) {
        return metrics[index];
      }).map(function (statementMeta) {
        var _this3$_getMetricOrig = _this3._getMetricOriginalLocations([statementMeta]),
            _this3$_getMetricOrig2 = _slicedToArray(_this3$_getMetricOrig, 1),
            location = _this3$_getMetricOrig2[0];

        return location;
      }).reduce(this._arrayToArrayLikeObject, {});
    }
  }, {
    key: "_fnMapTransformer",
    value: function _fnMapTransformer(metrics) {
      var _this4 = this;

      return Object.keys(metrics).map(function (index) {
        return metrics[index];
      }).map(function (fnMeta) {
        var _this4$_getMetricOrig = _this4._getMetricOriginalLocations([fnMeta.loc]),
            _this4$_getMetricOrig2 = _slicedToArray(_this4$_getMetricOrig, 1),
            loc = _this4$_getMetricOrig2[0]; // Force remove the last skip key


        if (fnMeta.skip === undefined) {
          delete fnMeta.skip;

          if (loc.skip !== undefined) {
            fnMeta.skip = loc.skip;
          }
        }

        return _objectSpread({}, fnMeta, {
          loc: loc
        });
      }).reduce(this._arrayToArrayLikeObject, {});
    }
  }, {
    key: "_branchMapTransformer",
    value: function _branchMapTransformer(metrics) {
      var _this5 = this;

      return Object.keys(metrics).map(function (index) {
        return metrics[index];
      }).map(function (branchMeta) {
        return _objectSpread({}, branchMeta, {}, {
          locations: _this5._getMetricOriginalLocations(branchMeta.locations)
        });
      }).reduce(this._arrayToArrayLikeObject, {});
    } ////

  }, {
    key: "_getMetricOriginalLocations",
    value: function _getMetricOriginalLocations() {
      var _this6 = this;

      var metricLocations = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var o = {
        line: 0,
        column: 0
      };
      return metricLocations.map(function (generatedPositions) {
        return [_this6._getOriginalPositionsFor(generatedPositions), generatedPositions];
      }).map(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2),
            _ref5$ = _ref5[0],
            start = _ref5$.start,
            end = _ref5$.end,
            generatedPosition = _ref5[1];

        var postitions = [start.line, start.column, end.line, end.column];
        var isValid = postitions.every(function (n) {
          return n !== null;
        }); // Matches behavior in _fnMapTransformer above.

        if (generatedPosition.skip === undefined) {
          delete generatedPosition.skip;
        }

        return isValid ? _objectSpread({}, generatedPosition, {
          start: start,
          end: end
        }) : {
          start: o,
          end: o,
          skip: true
        };
      });
    }
  }, {
    key: "_getOriginalPositionsFor",
    value: function _getOriginalPositionsFor() {
      var _this7 = this;

      var generatedPositions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        start: {},
        end: {}
      };
      return POSITIONS.map(function (position) {
        return [generatedPositions[position], position];
      }).reduce(function (originalPositions, _ref6) {
        var _ref7 = _slicedToArray(_ref6, 2),
            generatedPosition = _ref7[0],
            position = _ref7[1];

        var originalPosition = _this7._babelMap.originalPositionFor(generatedPosition); // remove extra keys


        delete originalPosition.name;
        delete originalPosition.source;
        originalPositions[position] = originalPosition;
        return originalPositions;
      }, {});
    }
  }, {
    key: "_arrayToArrayLikeObject",
    value: function _arrayToArrayLikeObject(arrayLikeObject, item, index) {
      arrayLikeObject[index + 1] = item;
      return arrayLikeObject;
    }
  }]);

  return Instrumenter;
}(_istanbul["default"].Instrumenter);

exports.Instrumenter = Instrumenter;