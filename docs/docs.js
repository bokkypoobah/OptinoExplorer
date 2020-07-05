const Docs = {
  template: `
    <div class="mt-5 pt-3">
      <b-card no-body header="Documentation" class="border-0" header-class="p-1">
        <b-card no-body class="border-0 m-0 mt-2">
          <b-tabs v-model="section" pills card vertical end nav-class="m-1 p-1" active-tab-class="m-1 mt-2 p-1">

            <b-tab title="Intro" @click.prevent="updateRouterParamsSectionTopic('intro', 'top')">
              <b-card-text>
                <h5 ref="intro_top" class="mb-3">Intro</h5>
                See <b-link @click.prevent="section = 3; updateRouterParamsSectionTopic('formulae', 'algorithms')">Formulae - Algorithms</b-link>
              </b-card-text>
            </b-tab>

            <b-tab title="Risks" @click.prevent="updateRouterParamsSectionTopic('risks', 'top')">

              <b-card-text>
                <h5 ref="risks_top" class="mb-3">Risks</h5>
                Risks
              </b-card-text>
            </b-tab>

            <b-tab title="How To" @click.prevent="updateRouterParamsSectionTopic('howto', 'top')">
              <b-card-text>
                <h5 ref="howto_top" class="mb-3">How To ...</h5>
                How To ...
              </b-card-text>
            </b-tab>

            <b-tab title="Formulae" @click.prevent="updateRouterParamsSectionTopic('formulae', 'top')">
              <b-card-text>
                <h5 ref="formulae_top" class="mb-3">Formulae</h5>
                <ul>
                  <li><b-link @click.prevent="scrollTo('formulae_optionpayoffformulae')">Option Payoff Formulae</b-link>
                    <ul>
                      <li>Vanilla Call Option Payoff</li>
                      <li>Capped Call Option Payoff</li>
                      <li>Vanilla Put Option Payoff</li>
                      <li>Floored Put Option Payoff</li>
                    </ul>
                  </li>
                  <li><b-link @click.prevent="scrollTo('formulae_algorithms')">Algorithms</b-link>
                    <ul>
                      <li>Decimal Places</li>
                      <li>Call Payoff And Collateral</li>
                      <li>Put Payoff And Collateral</li>
                    </ul>
                  </li>
                  <li><b-link @click.prevent="scrollTo('formulae_solidityimplementation')">Ethereum Solidity Smart Contract Implementation</b-link></li>
                </ul>
                <hr />

                <br />
                <h5 ref="formulae_optionpayoffformulae" class="mb-3">Option Payoff Formulae</h5>
                <p>This first version of the Optino Protocol implements the following option payoff formulae. Refer to <b-link href="https://books.google.com.au/books?id=LYTVCgAAQBAJ&lpg=PA580&ots=5--ulSKjbr&dq=capped%20call%20floored%20put&pg=PA578#v=onepage&q=capped%20call%20floored%20put&f=false" class="card-link" target="_blank">Zhang, P.G. (1998) Exotic Options: A Guide To Second Generation Options (2nd Edition), pages 578 - 582</b-link> for further information about Capped Calls and Floored Puts.</p>

                <br />
                <h6>Vanilla Call Option Payoff</h6>
                <pre><code class="solidity m-2 p-2">vanillaCallPayoff = max(spot - strike, 0)</code></pre>

                <h6>Capped Call Option Payoff</h6>
                <pre><code class="solidity m-2 p-2">cappedCallPayoff = max(min(spot, cap) - strike, 0)
                 = max(spot - strike, 0) - max(spot - cap, 0)</code></pre>

                <h6>Vanilla Put Option Payoff</h6>
                <pre><code class="solidity m-2 p-2">vanillaPutPayoff = max(strike - spot, 0)</code></pre>

                <h6>Floored Put Option Payoff</h6>
                <pre><code class="solidity m-2 p-2">flooredPutPayoff = max(strike - max(spot, floor), 0)
                 = max(strike - spot, 0) - max(floor - spot, 0)</code></pre>

                <hr />

                <br />
                <h5 ref="formulae_algorithms" class="mb-3">Algorithms</h5>
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
                <pre><code class="solidity m-2 p-2">callPayoff = 0
if (spot > 0 && spot > strike) {
  if (bound > strike && spot > bound) {
    callPayoff = [(bound - strike) / spot] x [tokens / (10^optinoDecimals)] x (10^decimals0)
  } else {
    callPayoff = [(spot - strike) / spot] x [tokens / (10^optinoDecimals)] x (10^decimals0)
  }
}</code></pre>
                <p>Call Collateral:</p>
                <pre><code class="solidity m-2 p-2">if (bound <= strike) {
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
                <pre><code class="solidity m-2 p-2">putPayoff = 0
if (spot < strike) {
  if (bound == 0 || (bound > 0 && spot >= bound)) {
    putPayoff = [(strike - spot) / (10^rateDecimals)] x [tokens / (10^optinoDecimals)] x (10^decimals1)
  } else {
    putPayoff = [(strike - bound) / (10^rateDecimals)] x [tokens / (10^optinoDecimals)] x (10^decimals1)
  }
}</code></pre>
                <p>Put Collateral:</p>
                <pre><code class="solidity m-2 p-2">putCollateral = [(strike - bound) / (10^rateDecimals)] x [tokens / (10^optinoDecimals)] x (10^decimals1)</code></pre>

                <hr />

                <br />
                <h5 ref="formulae_solidityimplementation" class="mb-3">Ethereum Solidity Smart Contract Implementation</h5>
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

                <pre><code class="solidity m-2 p-2">/// @notice Vanilla, capped call and floored put options formulae for 100% collateralisation
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

            <b-tab title="Factory" @click.prevent="updateRouterParamsSectionTopic('factory', 'top')">
              <b-card-text>
                <h5 ref="factory_top" class="mb-3">Factory</h5>
                Factory
              </b-card-text>
            </b-tab>

            <b-tab title="Optino And Cover" @click.prevent="updateRouterParamsSectionTopic('optinoandcover', 'top')">
              <b-card-text>
                <h5 ref="optinoandcover_top" class="mb-3">Optino And Cover</h5>
                Optino And Cover
              </b-card-text>
            </b-tab>

            <!--
            <b-tab title="Reference" @click.prevent="updateRouterParamsSectionTopic('reference', 'top')">
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
      section: 2,
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
  watch: {
    '$route' (to, from) {
      logInfo("Docs", "watch.$route(to:" + to.params.section + "/" + to.params.topic + ", from:" + from.params.section + "/" + from.params.topic + ")");
      if ("intro" == to.params.section) {
        this.section = 0;
      } else if ("risks" == to.params.section) {
        this.section = 1;
      } else if ("howto" == to.params.section) {
        this.section = 2;
      } else if ("formulae" == to.params.section) {
        this.section = 3;
      } else if ("factory" == to.params.section) {
        this.section = 4;
      } else if ("optinoandcover" == to.params.section) {
        this.section = 5;
      } else if ("all" == to.params.section) {
        this.section = 3;
      }
      // console.log(this.$refs);
      // const toDepth = to.path.split('/').length
      // const fromDepth = from.path.split('/').length
      // this.transitionName = toDepth < fromDepth ? 'slide-right' : 'slide-left'
    }
  },
  methods: {
    updateRouterParamsSectionTopic(section, topic) {
      logInfo("Docs", "updateRouterParamsSectionTopic(" + JSON.stringify(section) + ", " + topic + ")");
      this.$router.push({ params: { section: section, topic: topic }}).catch(err => {});
      var t = this;
      setTimeout(function() {
        t.scrollTo(section + "_" + topic);
      }, 1000);
    },
    highlightIt() {
      logInfo("Docs", "highlightIt() Called");
      var t = this;
      setTimeout(function() {
        logInfo("Docs", "highlightIt() hljs init");
        hljs.registerLanguage('solidity', window.hljsDefineSolidity);
        hljs.initHighlightingOnLoad();
      }, 2500);
    },
    scrollTo(refName) {
      logInfo("Docs", "scrollTo(" + refName + ")");
      var element = this.$refs[refName];
      var top = element.offsetTop;
      window.scrollTo(0, top);
    }
  },
  updated() {
    // logInfo("Docs", "updated() Called");
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightBlock(block);
    });
  },
  mounted() {
    logInfo("Docs", "mounted() $route: " + JSON.stringify(this.$route.params));
    if ("intro" == this.$route.params.section) {
      this.section = 0;
    } else if ("risks" == this.$route.params.section) {
      this.section = 1;
    } else if ("howto" == this.$route.params.section) {
      this.section = 2;
    } else if ("formulae" == this.$route.params.section) {
      this.section = 3;
    } else if ("factory" == this.$route.params.section) {
      this.section = 4;
    } else if ("optinoandcover" == this.$route.params.section) {
      this.section = 5;
    } else if ("all" == this.$route.params.section) {
      this.section = 3;
    }
    hljs.registerLanguage('solidity', window.hljsDefineSolidity);
    // document.addEventListener('DOMContentLoaded', (event) => {
      document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
        // console.log("hljs: " + JSON.stringify(block));
      });
    // });
  },
};
