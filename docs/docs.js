const Docs = {
  template: `
    <div class="mt-5 pt-3">
      <b-card no-body header="Documentation" class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-2">
          <b-tabs pills card vertical end>
            <b-tab title="Intro">
              <b-card-text>
                Intro
              </b-card-text>
            </b-tab>
            <b-tab title="Formulae" active>
              <b-card-text>
                <h5 class="mb-3">Table Of Contents</h5>
                <ul>
                  <li><b-link @click="scrollMeTo('optionpayoffformulae')">Option Payoff Formulae</b-link>
                    <ul>
                      <li>Vanilla Call Option Payoff</li>
                      <li>Capped Call Option Payoff</li>
                      <li>Vanilla Put Option Payoff</li>
                      <li>Floored Put Option Payoff</li>
                    </ul>
                  </li>
                  <li><b-link @click="scrollMeTo('algorithms')">Algorithms</b-link>
                    <ul>
                      <li>Decimal Places</li>
                      <li>Call Payoff And Collateral</li>
                      <li>Put Payoff And Collateral</li>
                    </ul>
                  </li>
                  <li><b-link @click="scrollMeTo('solidityimplementation')">Ethereum Solidity Smart Contract Implementation</b-link></li>
                </ul>
                <hr />

                <a ref="optionpayoffformulae"></a>
                <br />
                <h5 class="mb-3">Option Payoff Formulae</h5>
                <p>The following traditional option pricing formulae are used to build the algorithms and the Ethereum Solidity implementation below.</p>
                <h6>Vanilla Call Option Payoff</h6>
                <pre><code class="solidity m-3 p-1">
vanillaCallPayoff = max(spot - strike, 0)</code></pre>

                <h6>Capped Call Option Payoff</h6>
                <pre><code class="solidity m-3 p-1">
cappedCallPayoff = max(min(spot, cap) - strike, 0)
                 = max(spot - strike, 0) - max(spot - cap, 0)</code></pre>

                <h6>Vanilla Put Option Payoff</h6>
                <pre><code class="solidity m-3 p-1">
vanillaPutPayoff = max(strike - spot, 0)</code></pre>

                <h6>Floored Put Option Payoff</h6>
                <pre><code class="solidity m-3 p-1">
flooredPutPayoff = max(strike - max(spot, floor), 0)
                 = max(strike - spot, 0) - max(floor - spot, 0)</code></pre>

                <hr />

                <a ref="algorithms"></a>
                <br />
                <h5 class="mb-3">Algorithms</h5>
                <h6>Decimal Places</h6>
                <p>Four types of decimal places are involved in these calculations:</p>
                <ul>
                  <li><code>optinoDecimals</code> - for Optino and Cover tokens, hardcoded to 18</li>
                  <li><code>decimals0</code> for token0 (or baseToken), e.g. 18 decimals for WETH in WETH/USDx</li>
                  <li><code>decimals1</code> for token1 (or quoteToken), e.g. 6 decimals for USDx in WETH/USDx</li>
                  <li><code>rateDecimals</code> for the rate feed. e.g. 18 for MakerDAO's feeds</li>
                </ul>
                <br />

                <h6>Call Payoff And Collateral</h6>
                <p>Requirements:</p>
                <ul>
                  <li><code>strike</code> must be > 0</li>
                  <li><code>bound</code>, or <code>cap</code> must be 0 for vanilla calls or > <code>strike</code> for capped calls</li>
                  <li>Collateral is in the *token0* (or *baseToken*)</li>
                </ul>
                <p>Call Payoff:</p>
                <pre><code class="solidity m-3 p-1">
callPayoff = 0
if (spot > 0 && spot > strike) {
  if (bound > strike && spot > bound) {
    callPayoff = [(bound - strike) / spot] x [tokens / (10^optinoDecimals)] x (10^decimals0)
  } else {
    callPayoff = [(spot - strike) / spot] x [tokens / (10^optinoDecimals)] x (10^decimals0)
  }
}</code></pre>
                <p>Call Collateral:</p>
                <pre><code class="solidity m-3 p-1">
if (bound <= strike) {
  callCollateral = [tokens / (10^optinoDecimals)] x (10^decimals0)
} else {
  callCollateral = [(bound - strike) / bound] x [tokens / (10^optinoDecimals)] x (10^decimals0)
}</code></pre>
                <br />

                <h6>Put Payoff And Collateral</h6>
                <p>Requirements:</p>
                <ul>
                  <li><code>strike</code> must be > 0</li>
                  <li><code>bound</code>, or <code>floor</code> must be 0 for vanilla puts or < <code>strike</code> for floored puts</li>
                  <li>Collateral is in the *token1* (or *quoteToken*)</li>
                </ul>
                <p>Put Payoff:</p>
                <pre><code class="solidity m-3 p-1">
putPayoff = 0
if (spot < strike) {
  if (bound == 0 || (bound > 0 && spot >= bound)) {
    putPayoff = [(strike - spot) / (10^rateDecimals)] x [tokens / (10^optinoDecimals)] x (10^decimals1)
  } else {
    putPayoff = [(strike - bound) / (10^rateDecimals)] x [tokens / (10^optinoDecimals)] x (10^decimals1)
  }
}</code></pre>
                <p>Put Collateral:</p>
                <pre><code class="solidity m-3 p-1">
putCollateral = [(strike - bound) / (10^rateDecimals)] x [tokens / (10^optinoDecimals)] x (10^decimals1)</code></pre>

                <hr />

                <a ref="solidityimplementation"></a>
                <br />
                <h5>Ethereum Solidity Smart Contract Implementation</h5>
                <p>Info:</p>
                <ul>
                  <li>Using 256 bit unsigned integers</li>
                  <li>Divisions are performed last to reduce loss of precision</li>
                  <li><code>computeCollateral(...)</code> calculates the <code>collateral</code> as the maximum payoff</li>
                  <li><code>computePayoff(...)</code> calculates the <code>payoff</code> depending on the spot price, after expiry</li>
                  <li>Optino and Cover tokens can <code>close(...)</code> off against each other to release calculated <code>collateral</code> in proportion to the tokens closed/netted</li>
                  <li>Optino token holders execute <code>settle()</code> after expiry to receive the calculated <code>payoff</code> in proportion to the token holdings</li>
                  <li>Cover token holders execute <code>settle()</code> after expiry to receive the calculated <code>(collateral - payoff)</code> in proportion to the token holdings</li>
                </ul>
                <p>Solidity Code from factory <b-link :href="explorer + 'address/' + address + '#code'" class="card-link" target="_blank">{{ address }}</b-link> and template <b-link :href="explorer + 'address/' + optinoTokenTemplate + '#code'" class="card-link" target="_blank">{{ optinoTokenTemplate }}</b-link>:</p>

                <!-- <pre class="bg-light mx-4 my-2 p-2" style="color: #e83e8c;"> -->
                <pre><code class="solidity m-3 p-1">
/// @notice Vanilla, capped call and floored put options formulae for 100% collateralisation
// ----------------------------------------------------------------------------
// vanillaCallPayoff = max(spot - strike, 0)
// cappedCallPayoff  = max(min(spot, cap) - strike, 0)
//                   = max(spot - strike, 0) - max(spot - cap, 0)
// vanillaPutPayoff  = max(strike - spot, 0)
// flooredPutPayoff  = max(strike - max(spot, floor), 0)
//                   = max(strike - spot, 0) - max(floor - spot, 0)
// ----------------------------------------------------------------------------
contract OptinoFormulae is DataType {
    using SafeMath for uint;

    function shiftRightThenLeft(uint amount, uint8 right, uint8 left) internal pure returns (uint result) {
        if (right == left) {
            return amount;
        } else if (right > left) {
            return amount.mul(10 ** uint(right - left));
        } else {
            return amount.div(10 ** uint(left - right));
        }
    }

    function computeCollateral(uint[5] memory _seriesData, uint tokens, uint8[4] memory decimalsData) internal pure returns (uint collateral) {
        (uint callPut, uint strike, uint bound) = (_seriesData[uint(SeriesDataField.CallPut)], _seriesData[uint(SeriesDataField.Strike)], _seriesData[uint(SeriesDataField.Bound)]);
        (uint8 decimals, uint8 decimals0, uint8 decimals1, uint8 rateDecimals) = (decimalsData[0], decimalsData[1], decimalsData[2], decimalsData[3]);
        require(strike > 0, "strike must be > 0");
        if (callPut == 0) {
            require(bound == 0 || bound > strike, "Call bound must = 0 or > strike");
            if (bound <= strike) {
                return shiftRightThenLeft(tokens, decimals0, decimals);
            } else {
                return shiftRightThenLeft(bound.sub(strike).mul(tokens).div(bound), decimals0, decimals);
            }
        } else {
            require(bound < strike, "Put bound must = 0 or < strike");
            return shiftRightThenLeft(strike.sub(bound).mul(tokens), decimals1, decimals).div(10 ** uint(rateDecimals));
        }
    }

    function computePayoff(uint[5] memory _seriesData, uint spot, uint tokens, uint8[4] memory decimalsData) internal pure returns (uint payoff) {
        (uint callPut, uint strike, uint bound) = (_seriesData[uint(SeriesDataField.CallPut)], _seriesData[uint(SeriesDataField.Strike)], _seriesData[uint(SeriesDataField.Bound)]);
        return _computePayoff(callPut, strike, bound, spot, tokens, decimalsData);
    }
    function _computePayoff(uint callPut, uint strike, uint bound, uint spot, uint tokens, uint8[4] memory decimalsData) internal pure returns (uint payoff) {
        (uint8 decimals, uint8 decimals0, uint8 decimals1, uint8 rateDecimals) = (decimalsData[0], decimalsData[1], decimalsData[2], decimalsData[3]);
        require(strike > 0, "strike must be > 0");
        if (callPut == 0) {
            require(bound == 0 || bound > strike, "Call bound must = 0 or > strike");
            if (spot > 0 && spot > strike) {
                if (bound > strike && spot > bound) {
                    return shiftRightThenLeft(bound.sub(strike).mul(tokens), decimals0, decimals).div(spot);
                } else {
                    return shiftRightThenLeft(spot.sub(strike).mul(tokens), decimals0, decimals).div(spot);
                }
            }
        } else {
            require(bound < strike, "Put bound must = 0 or < strike");
            if (spot < strike) {
                 if (bound == 0 || (bound > 0 && spot >= bound)) {
                     return shiftRightThenLeft(strike.sub(spot).mul(tokens), decimals1, decimals + rateDecimals);
                 } else {
                     return shiftRightThenLeft(strike.sub(bound).mul(tokens), decimals1, decimals + rateDecimals);
                 }
            }
        }
    }
}</code></pre>
              </b-card-text>
            </b-tab>
            <!--
            <b-tab title="Risks">
              <b-card-text>Risks</b-card-text>
            </b-tab>
            -->
            <!--
            <b-tab title="Reference">
              <b-card-text>Reference</b-card-text>
            </b-tab>
            -->
          </b-tabs>
        </b-card>
      </b-card>

      <!--
      <b-card no-body header="Documentation" class="border-0" header-class="p-1">
        <b-card-body class="m-1 p-1">
          <b-row>
            <b-col cols="10">
              <b-collapse id="accordion-docs" visible accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <b-card-text>docs I start opened because <code>visible</code> is <code>true</code></b-card-text>
                  <b-card-text>{{ text }}</b-card-text>
                </b-card-body>
              </b-collapse>
              <b-collapse id="accordion-risks" accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <b-card-text>risks I start opened because <code>visible</code> is <code>true</code></b-card-text>
                  <b-card-text>{{ text }}</b-card-text>
                </b-card-body>
              </b-collapse>
              <b-collapse id="accordion-reference" accordion="my-accordion" role="tabpanel">
                <b-card-body>
                  <b-card-text>reference I start opened because <code>visible</code> is <code>true</code></b-card-text>
                  <b-card-text>{{ text }}</b-card-text>
                </b-card-body>
              </b-collapse>
            </b-col>
            <b-col cols="2">
              <b-list-group class="mt-5">
                <b-list-group-item v-b-toggle.accordion-docs>Docs Home</b-list-group-item>
                <b-list-group-item v-b-toggle.accordion-formulae>Formulae</b-list-group-item>
                <b-list-group-item v-b-toggle.accordion-risks>Risks</b-list-group-item>
                <b-list-group-item v-b-toggle.accordion-reference>Reference</b-list-group-item>
              </b-list-group>
            </b-col>
          </b-row>
        </b-card-body>
      </b-card>
      -->
    </div>
  `,
  data: function () {
    return {
    }
  },
  computed: {
    explorer() {
      return store.getters['connection/explorer'];
    },
    address() {
      return store.getters['optinoFactory/address'];
    },
    optinoTokenTemplate() {
      return store.getters['optinoFactory/optinoTokenTemplate'];
    },
  },
  methods: {
    highlightIt() {
      logInfo("Docs", "highlightIt() Called");
      var t = this;
      setTimeout(function() {
        logInfo("Docs", "highlightIt() hljs init");
        hljs.registerLanguage('solidity', window.hljsDefineSolidity);
        hljs.initHighlightingOnLoad();
      }, 2500);
    },
    scrollMeTo(refName) {
      var element = this.$refs[refName];
      var top = element.offsetTop;
      window.scrollTo(0, top);
    }
  },
  updated() {
    // logInfo("Docs", "updated() Called");
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
      // console.log("hljs: " + JSON.stringify(block));
    });
    // var t = this;
    // Vue.nextTick(function () {
    //   t.highlightIt();
    //   // DOM updated
    // });
    // this.highlightIt();
  },
  mounted() {
    // logInfo("Docs", "mounted() Called");
    hljs.registerLanguage('solidity', window.hljsDefineSolidity);
    // document.addEventListener('DOMContentLoaded', (event) => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
        // console.log("hljs: " + JSON.stringify(block));
      });
    // });
    // document.addEventListener('DOMContentLoaded', (event) => {
    //   document.querySelectorAll('pre code').forEach((block) => {
    //     hljs.highlightBlock(block);
    //   });
    // });

    // this.highlightIt();
    // hljs.initHighlightingOnLoad();

  },
};