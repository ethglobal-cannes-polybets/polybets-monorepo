/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/betting_pools_2.json`.
 */
export type BettingPools2 = {
  "address": "Bh2UXpftCKHCqM4sQwHUtY8DMBQ35fxaBrLyHadaUpVb",
  "metadata": {
    "name": "bettingPools2",
    "version": "0.1.1",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "adminWithdrawLmsrFunds",
      "discriminator": [
        148,
        149,
        156,
        107,
        243,
        14,
        144,
        246
      ],
      "accounts": [
        {
          "name": "bettingPoolsState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "lmsrPool",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "lmsrCollateralVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lmsrPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "adminTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "tokenType",
          "type": {
            "defined": {
              "name": "tokenType"
            }
          }
        }
      ]
    },
    {
      "name": "adminWithdrawOriginalPoolFunds",
      "discriminator": [
        134,
        159,
        117,
        231,
        219,
        116,
        176,
        226
      ],
      "accounts": [
        {
          "name": "bettingPoolsState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "originalPool",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "originalPoolCollateralVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "originalPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "adminTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "tokenType",
          "type": {
            "defined": {
              "name": "tokenType"
            }
          }
        }
      ]
    },
    {
      "name": "buyLmsrTokens",
      "discriminator": [
        133,
        115,
        98,
        236,
        21,
        139,
        174,
        231
      ],
      "accounts": [
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "lmsrPool",
          "writable": true
        },
        {
          "name": "inputCollateralMint"
        },
        {
          "name": "userCollateralTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "inputCollateralMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lmsrCollateralVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lmsrPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "inputCollateralMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lmsrOutcomeTokenMint",
          "writable": true
        },
        {
          "name": "userLmsrTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "buyer"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lmsrOutcomeTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "inputCollateralAmount",
          "type": "u64"
        },
        {
          "name": "outcomeIndex",
          "type": "u64"
        },
        {
          "name": "collateralTokenType",
          "type": {
            "defined": {
              "name": "tokenType"
            }
          }
        },
        {
          "name": "minOutcomeTokensToReceive",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimLmsrPayout",
      "discriminator": [
        129,
        87,
        237,
        173,
        250,
        169,
        179,
        117
      ],
      "accounts": [
        {
          "name": "claimant",
          "writable": true,
          "signer": true
        },
        {
          "name": "lmsrPool",
          "writable": true
        },
        {
          "name": "originalPool",
          "writable": true
        },
        {
          "name": "collateralMint"
        },
        {
          "name": "lmsrCollateralVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lmsrPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collateralMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "userCollateralTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "claimant"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collateralMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lmsrOutcomeTokenMint",
          "writable": true
        },
        {
          "name": "userLmsrTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "claimant"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lmsrOutcomeTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "originalPoolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "originalPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collateralMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "outcomeIndex",
          "type": "u64"
        },
        {
          "name": "collateralTokenType",
          "type": {
            "defined": {
              "name": "tokenType"
            }
          }
        },
        {
          "name": "tokensToRedeem",
          "type": "u64"
        }
      ]
    },
    {
      "name": "claimPayout",
      "discriminator": [
        127,
        240,
        132,
        62,
        227,
        198,
        146,
        133
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "lmsrPool",
          "writable": true,
          "optional": true
        },
        {
          "name": "lmsrCollateralVault",
          "writable": true,
          "optional": true
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "bet",
          "writable": true
        },
        {
          "name": "bettor",
          "docs": [
            "The user claiming the payout (and payer for ATA initialization)"
          ],
          "writable": true,
          "signer": true
        },
        {
          "name": "userTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bettor"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolPaymentTokenAccount",
          "docs": [
            "The pool's token account holding the funds (source of payout)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "yesUsdcMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "noUsdcMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "yesPointsMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "noPointsMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "betLpTokenMint",
          "writable": true
        },
        {
          "name": "userBetTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bettor"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "betLpTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createPool",
      "docs": [
        "Create a new betting pool.",
        "Calls the handler in `instructions::create_pool`."
      ],
      "discriminator": [
        233,
        146,
        209,
        142,
        207,
        104,
        64,
        188
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "betting_pools.next_pool_id",
                "account": "bettingPoolsState"
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "yesUsdc",
          "docs": [
            "Mint for the first token (Yes USDC)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "betting_pools.next_pool_id",
                "account": "bettingPoolsState"
              }
            ]
          }
        },
        {
          "name": "noUsdc",
          "docs": [
            "Mint for the second token (No USDC)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "betting_pools.next_pool_id",
                "account": "bettingPoolsState"
              }
            ]
          }
        },
        {
          "name": "yesPoints",
          "docs": [
            "Mint for the third token (Yes Points)"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "betting_pools.next_pool_id",
                "account": "bettingPoolsState"
              }
            ]
          }
        },
        {
          "name": "noPoints",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "betting_pools.next_pool_id",
                "account": "bettingPoolsState"
              }
            ]
          }
        },
        {
          "name": "metadataYesUsdc",
          "docs": [
            "Metadata account for Yes USDC token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "yesUsdc"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "metadataNoUsdc",
          "docs": [
            "Metadata account for No USDC token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "noUsdc"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "metadataYesPoints",
          "docs": [
            "Metadata account for Yes Points token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "yesPoints"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "metadataNoPoints",
          "docs": [
            "Metadata account for No Points token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "const",
                "value": [
                  11,
                  112,
                  101,
                  177,
                  227,
                  209,
                  124,
                  69,
                  56,
                  157,
                  82,
                  127,
                  107,
                  4,
                  195,
                  205,
                  88,
                  184,
                  108,
                  115,
                  26,
                  160,
                  253,
                  181,
                  73,
                  182,
                  209,
                  188,
                  3,
                  248,
                  41,
                  70
                ]
              },
              {
                "kind": "account",
                "path": "noPoints"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                11,
                112,
                101,
                177,
                227,
                209,
                124,
                69,
                56,
                157,
                82,
                127,
                107,
                4,
                195,
                205,
                88,
                184,
                108,
                115,
                26,
                160,
                253,
                181,
                73,
                182,
                209,
                188,
                3,
                248,
                41,
                70
              ]
            }
          }
        },
        {
          "name": "mplTokenMetadata",
          "address": "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "question",
          "type": "string"
        },
        {
          "name": "options",
          "type": {
            "array": [
              "string",
              2
            ]
          }
        },
        {
          "name": "betsCloseAt",
          "type": "i64"
        },
        {
          "name": "mediaUrl",
          "type": "string"
        },
        {
          "name": "mediaType",
          "type": {
            "defined": {
              "name": "mediaType"
            }
          }
        },
        {
          "name": "category",
          "type": "string"
        },
        {
          "name": "creatorName",
          "type": "string"
        },
        {
          "name": "creatorId",
          "type": "string"
        },
        {
          "name": "closureCriteria",
          "type": "string"
        },
        {
          "name": "closureInstructions",
          "type": "string"
        }
      ]
    },
    {
      "name": "gradeBet",
      "discriminator": [
        163,
        14,
        104,
        39,
        20,
        221,
        88,
        64
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "bettingPools"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "responseOption",
          "type": "u64"
        },
        {
          "name": "decisionTimeOverride",
          "type": {
            "option": "i64"
          }
        }
      ]
    },
    {
      "name": "initialize",
      "docs": [
        "Initialize the BettingPools program",
        "Similar to the constructor in the Solidity version"
      ],
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "usdcMint"
        },
        {
          "name": "betPointsMint"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "payoutFeeBp",
          "type": "u16"
        },
        {
          "name": "tradingFees",
          "type": "u16"
        }
      ]
    },
    {
      "name": "migrateToLmsrPool",
      "docs": [
        "Migrate a graded pool to an LMSR pool"
      ],
      "discriminator": [
        35,
        240,
        77,
        95,
        223,
        4,
        215,
        133
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "migrator",
          "writable": true,
          "signer": true
        },
        {
          "name": "originalPool",
          "writable": true
        },
        {
          "name": "betPoints"
        },
        {
          "name": "lmsrPool",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  108,
                  109,
                  115,
                  114,
                  95,
                  112,
                  111,
                  111,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "original_pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "yesLmsrUsdcMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  108,
                  109,
                  115,
                  114,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "original_pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "noLmsrUsdcMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  108,
                  109,
                  115,
                  114,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "original_pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "yesLmsrPointsMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  108,
                  109,
                  115,
                  114,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "original_pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "noLmsrPointsMint",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  108,
                  109,
                  115,
                  114,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "original_pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "migratorPointsTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "migrator"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "betPoints"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lmsrPoolPointsTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lmsrPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "betPoints"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "placeBet",
      "discriminator": [
        222,
        62,
        67,
        220,
        63,
        166,
        126,
        33
      ],
      "accounts": [
        {
          "name": "bettor",
          "writable": true,
          "signer": true
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "bettingPools",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The authority defined in the betting_pools state (fee recipient)"
          ]
        },
        {
          "name": "paymentMint",
          "docs": [
            "The mint user is paying with (USDC or BetPoints).",
            "Checked against betting_pools state."
          ],
          "writable": true
        },
        {
          "name": "bettorPaymentTokenAccount",
          "docs": [
            "Bettor's ATA for the payment token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bettor"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "paymentMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "poolPaymentTokenAccount",
          "docs": [
            "Pool's ATA for the payment token (where payment is sent).",
            "Needs to be initialized separately (e.g., via frontend or another instruction)."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "pool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "paymentMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "authorityTokenAccount",
          "docs": [
            "Fee destination token account (ATA). Authority is the betting_pools.authority"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "authority"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "paymentMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "targetPoolMint",
          "docs": [
            "The specific mint the user will receive (e.g., Yes-USDC).",
            "Checked against one of the four pool mints below."
          ],
          "writable": true
        },
        {
          "name": "bettorTargetTokenAccount",
          "docs": [
            "Bettor's ATA for the target pool token."
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "bettor"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "targetPoolMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "yesUsdcMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "noUsdcMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  117,
                  115,
                  100,
                  99,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "yesPointsMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  121,
                  101,
                  115,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "noPointsMint",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  110,
                  111,
                  95,
                  112,
                  111,
                  105,
                  110,
                  116,
                  115,
                  95,
                  109,
                  105,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              }
            ]
          }
        },
        {
          "name": "bet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "pool.id",
                "account": "pool"
              },
              {
                "kind": "account",
                "path": "betting_pools.next_bet_id",
                "account": "bettingPoolsState"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "optionIndex",
          "type": "u64"
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "minOutputAmount",
          "type": "u64"
        },
        {
          "name": "tokenType",
          "type": {
            "defined": {
              "name": "tokenType"
            }
          }
        }
      ]
    },
    {
      "name": "sellLmsrTokens",
      "discriminator": [
        127,
        184,
        141,
        46,
        36,
        60,
        8,
        110
      ],
      "accounts": [
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "lmsrPool",
          "writable": true
        },
        {
          "name": "lmsrOutcomeTokenMint",
          "writable": true
        },
        {
          "name": "userLmsrTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "lmsrOutcomeTokenMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "collateralPayoutMint"
        },
        {
          "name": "userCollateralTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "seller"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collateralPayoutMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "lmsrCollateralVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "lmsrPool"
              },
              {
                "kind": "const",
                "value": [
                  6,
                  221,
                  246,
                  225,
                  215,
                  101,
                  161,
                  147,
                  217,
                  203,
                  225,
                  70,
                  206,
                  235,
                  121,
                  172,
                  28,
                  180,
                  133,
                  237,
                  95,
                  91,
                  55,
                  145,
                  58,
                  140,
                  245,
                  133,
                  126,
                  255,
                  0,
                  169
                ]
              },
              {
                "kind": "account",
                "path": "collateralPayoutMint"
              }
            ],
            "program": {
              "kind": "const",
              "value": [
                140,
                151,
                37,
                143,
                78,
                36,
                137,
                241,
                187,
                61,
                16,
                41,
                20,
                142,
                13,
                131,
                11,
                90,
                19,
                153,
                218,
                255,
                16,
                132,
                4,
                142,
                123,
                216,
                219,
                233,
                248,
                89
              ]
            }
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "associatedTokenProgram",
          "address": "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "lmsrTokensToSell",
          "type": "u64"
        },
        {
          "name": "outcomeIndex",
          "type": "u64"
        },
        {
          "name": "collateralTokenType",
          "type": {
            "defined": {
              "name": "tokenType"
            }
          }
        },
        {
          "name": "minCollateralToReceive",
          "type": "u64"
        }
      ]
    },
    {
      "name": "setMedia",
      "docs": [
        "Update the media URL and type for a pool"
      ],
      "discriminator": [
        10,
        60,
        163,
        255,
        4,
        75,
        82,
        109
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "pool",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "mediaUrl",
          "type": "string"
        },
        {
          "name": "mediaType",
          "type": {
            "defined": {
              "name": "mediaType"
            }
          }
        }
      ]
    },
    {
      "name": "setPayoutFee",
      "docs": [
        "Set the payout fee for the protocol"
      ],
      "discriminator": [
        251,
        168,
        154,
        193,
        25,
        67,
        146,
        192
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true,
          "relations": [
            "bettingPools"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "payoutFeeBp",
          "type": "u16"
        }
      ]
    },
    {
      "name": "setTradingFees",
      "docs": [
        "Set the trading fees for the protocol"
      ],
      "discriminator": [
        219,
        54,
        22,
        94,
        99,
        176,
        235,
        144
      ],
      "accounts": [
        {
          "name": "bettingPools",
          "docs": [
            "The betting pools state account to update"
          ],
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  98,
                  101,
                  116,
                  116,
                  105,
                  110,
                  103,
                  95,
                  112,
                  111,
                  111,
                  108,
                  115
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "docs": [
            "The authority that can change trading fees"
          ],
          "writable": true,
          "signer": true,
          "relations": [
            "bettingPools"
          ]
        },
        {
          "name": "systemProgram",
          "docs": [
            "System program"
          ],
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "tradingFees",
          "type": "u16"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "bet",
      "discriminator": [
        147,
        23,
        35,
        59,
        15,
        75,
        155,
        32
      ]
    },
    {
      "name": "bettingPoolsState",
      "discriminator": [
        136,
        14,
        114,
        28,
        173,
        213,
        192,
        14
      ]
    },
    {
      "name": "lmsrPool",
      "discriminator": [
        50,
        134,
        152,
        31,
        220,
        36,
        39,
        10
      ]
    },
    {
      "name": "pool",
      "discriminator": [
        241,
        154,
        109,
        4,
        17,
        177,
        109,
        188
      ]
    }
  ],
  "events": [
    {
      "name": "betPlaced",
      "discriminator": [
        88,
        88,
        145,
        226,
        126,
        206,
        32,
        0
      ]
    },
    {
      "name": "lmsrPayoutClaimed",
      "discriminator": [
        69,
        165,
        28,
        56,
        17,
        133,
        213,
        137
      ]
    },
    {
      "name": "lmsrSharesBought",
      "discriminator": [
        218,
        50,
        190,
        138,
        217,
        215,
        66,
        113
      ]
    },
    {
      "name": "lmsrSharesSold",
      "discriminator": [
        145,
        58,
        61,
        192,
        84,
        13,
        12,
        67
      ]
    },
    {
      "name": "payoutClaimed",
      "discriminator": [
        200,
        39,
        105,
        112,
        116,
        63,
        58,
        149
      ]
    },
    {
      "name": "poolClosed",
      "discriminator": [
        106,
        46,
        29,
        231,
        42,
        44,
        73,
        119
      ]
    },
    {
      "name": "poolCreated",
      "discriminator": [
        202,
        44,
        41,
        88,
        104,
        220,
        157,
        82
      ]
    },
    {
      "name": "poolLockedAndAbleToMigrate",
      "discriminator": [
        86,
        43,
        152,
        201,
        52,
        69,
        47,
        133
      ]
    },
    {
      "name": "poolMediaSet",
      "discriminator": [
        248,
        179,
        164,
        142,
        185,
        80,
        167,
        217
      ]
    },
    {
      "name": "poolMigratedToLmsr",
      "discriminator": [
        253,
        147,
        140,
        76,
        243,
        21,
        70,
        222
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "betsCloseTimeInPast",
      "msg": "Bets close time must be in the future"
    },
    {
      "code": 6001,
      "name": "betsCloseAfterDecision",
      "msg": "Bets close time must be before decision time"
    },
    {
      "code": 6002,
      "name": "poolNotOpen",
      "msg": "Pool is not open"
    },
    {
      "code": 6003,
      "name": "poolDoesntExist",
      "msg": "Pool doesn't exist"
    },
    {
      "code": 6004,
      "name": "bettingPeriodClosed",
      "msg": "Betting period is closed"
    },
    {
      "code": 6005,
      "name": "invalidOptionIndex",
      "msg": "Invalid option index"
    },
    {
      "code": 6006,
      "name": "betAlreadyExists",
      "msg": "Bet already exists"
    },
    {
      "code": 6007,
      "name": "alreadyInitialized",
      "msg": "BettingPools is already initialized"
    },
    {
      "code": 6008,
      "name": "notInitialized",
      "msg": "BettingPools is not initialized"
    },
    {
      "code": 6009,
      "name": "zeroAmount",
      "msg": "Zero amount"
    },
    {
      "code": 6010,
      "name": "minimumCollateralZero",
      "msg": "Minimum collateral should be greater than zero"
    },
    {
      "code": 6011,
      "name": "insufficientBalance",
      "msg": "Insufficient balance"
    },
    {
      "code": 6012,
      "name": "notAuthorized",
      "msg": "Not authorized"
    },
    {
      "code": 6013,
      "name": "tokenTransferFailed",
      "msg": "Token transfer failed"
    },
    {
      "code": 6014,
      "name": "poolNotGraded",
      "msg": "Pool not graded"
    },
    {
      "code": 6015,
      "name": "betAlreadyPaidOut",
      "msg": "Bet already paid out"
    },
    {
      "code": 6016,
      "name": "gradingError",
      "msg": "Grading error"
    },
    {
      "code": 6017,
      "name": "bettingPeriodNotClosed",
      "msg": "Betting period not closed"
    },
    {
      "code": 6018,
      "name": "invalidPayoutFee",
      "msg": "Invalid payout fee"
    },
    {
      "code": 6019,
      "name": "poolAlreadyGraded",
      "msg": "Pool already graded"
    },
    {
      "code": 6020,
      "name": "invalidResponseOption",
      "msg": "Invalid response option"
    },
    {
      "code": 6021,
      "name": "bettingNotInitialized",
      "msg": "Betting not initialized"
    },
    {
      "code": 6022,
      "name": "arithmeticOverflow",
      "msg": "Arithmetic overflow"
    },
    {
      "code": 6023,
      "name": "insufficientPaymentForMinimumOutput",
      "msg": "Payment amount is less than the calculated cost for the minimum desired output."
    },
    {
      "code": 6024,
      "name": "tokenAccountMismatch",
      "msg": "The provided token account does not match the expected mint."
    },
    {
      "code": 6025,
      "name": "slippageExceeded",
      "msg": "Slippage limit exceeded"
    },
    {
      "code": 6026,
      "name": "oraclePriceDeviationExceeded",
      "msg": "Oracle price is outside the allowed deviation"
    },
    {
      "code": 6027,
      "name": "slippageToleranceExceeded",
      "msg": "Calculated output amount is less than the specified minimum output amount"
    },
    {
      "code": 6028,
      "name": "winnerListFull",
      "msg": "Winner list is full"
    },
    {
      "code": 6029,
      "name": "betLost",
      "msg": "Bet lost and cannot be claimed"
    },
    {
      "code": 6030,
      "name": "betPoolMismatch",
      "msg": "Bet pool mismatch"
    },
    {
      "code": 6031,
      "name": "notBetOwner",
      "msg": "Not the bet owner"
    },
    {
      "code": 6032,
      "name": "divisionByZero",
      "msg": "Division by zero"
    },
    {
      "code": 6033,
      "name": "calculationOverflow",
      "msg": "Calculation overflow"
    },
    {
      "code": 6034,
      "name": "invalidVaultAuthority",
      "msg": "Invalid vault authority"
    },
    {
      "code": 6035,
      "name": "userTokenAccountMismatch",
      "msg": "User token account does not belong to the user"
    },
    {
      "code": 6036,
      "name": "tokenMintMismatch",
      "msg": "Token mint mismatch between user and vault accounts"
    },
    {
      "code": 6037,
      "name": "vaultMintMismatch",
      "msg": "Vault token mint does not match bet token type"
    },
    {
      "code": 6038,
      "name": "invalidAuthority",
      "msg": "Provided authority does not match the one stored in the betting pools state."
    },
    {
      "code": 6039,
      "name": "insufficientVaultBalance",
      "msg": "Insufficient funds in the vault for payout"
    },
    {
      "code": 6040,
      "name": "invalidPaymentMint",
      "msg": "The provided payment mint is not the configured USDC or BetPoints mint."
    },
    {
      "code": 6041,
      "name": "payoutCalculationError",
      "msg": "Error during payout calculation logic."
    },
    {
      "code": 6042,
      "name": "underflow",
      "msg": "Arithmetic underflow"
    },
    {
      "code": 6043,
      "name": "cannotMigrateEmptyPool",
      "msg": "Cannot migrate an empty pool with no initial funding."
    },
    {
      "code": 6044,
      "name": "poolNotGradedOrResolved",
      "msg": "Pool is not graded or resolved, cannot migrate."
    },
    {
      "code": 6045,
      "name": "poolAlreadyMigrated",
      "msg": "Pool has already been migrated to LMSR."
    },
    {
      "code": 6046,
      "name": "poolNotMigrated",
      "msg": "Pool is not migrated, cannot migrate to LMSR."
    },
    {
      "code": 6047,
      "name": "lmsrPoolMismatch",
      "msg": "LMSR pool does not match the original pool"
    },
    {
      "code": 6048,
      "name": "poolIsDraw",
      "msg": "Pool resulted in a draw, LMSR payout is not applicable."
    },
    {
      "code": 6049,
      "name": "insufficientOriginalPoolVaultBalance",
      "msg": "Insufficient funds in the original pool vault to cover LMSR payout shortfall."
    },
    {
      "code": 6050,
      "name": "invalidVault",
      "msg": "The provided LMSR collateral vault is invalid."
    },
    {
      "code": 6051,
      "name": "invalidMintDecimals",
      "msg": "LMSR outcome token mint has invalid decimals."
    },
    {
      "code": 6052,
      "name": "decimalMismatch",
      "msg": "Collateral token decimals do not match LMSR token decimals requirement."
    },
    {
      "code": 6053,
      "name": "lmsrCalculationFailure",
      "msg": "LMSR calculation failed due to iteration or convergence issue."
    },
    {
      "code": 6054,
      "name": "lmsrMathError",
      "msg": "A generic error occurred in an LMSR mathematical computation."
    },
    {
      "code": 6055,
      "name": "invalidBParameter",
      "msg": "The b parameter for LMSR must be positive."
    },
    {
      "code": 6056,
      "name": "poolLocked",
      "msg": "Pool is locked and cannot be used."
    },
    {
      "code": 6057,
      "name": "poolNotLocked",
      "msg": "Pool is not locked and cannot be used."
    },
    {
      "code": 6058,
      "name": "insufficientTokens",
      "msg": "Insufficient tokens to redeem."
    },
    {
      "code": 6059,
      "name": "invalidFee",
      "msg": "Invalid fee value"
    },
    {
      "code": 6060,
      "name": "insufficientFundsInPool",
      "msg": "Insufficient funds in the pool for withdrawal."
    },
    {
      "code": 6061,
      "name": "insufficientFundsInSourceAccount",
      "msg": "Insufficient funds in the source account for the transfer."
    },
    {
      "code": 6062,
      "name": "invalidAmount",
      "msg": "Invalid Amount"
    },
    {
      "code": 6063,
      "name": "cannotGradePoolBeforeBettingPeriodCloses",
      "msg": "Cannot grade pool before betting period closes at timestamp"
    },
    {
      "code": 6064,
      "name": "decisionTimeOverrideInFuture",
      "msg": "Decision time override cannot be in the future"
    },
    {
      "code": 6065,
      "name": "oracleNotFound",
      "msg": "Oracle not found for the given pool."
    },
    {
      "code": 6066,
      "name": "invalidLmsrVaultOwner",
      "msg": "LMSR collateral vault owner does not match LMSR pool PDA."
    },
    {
      "code": 6067,
      "name": "insufficientLmsrVaultBalance",
      "msg": "Insufficient balance in LMSR collateral vault to cover shortfall."
    },
    {
      "code": 6068,
      "name": "lmsrVaultNotProvided",
      "msg": "LMSR vault not provided for fallback when LMSR pool context is present."
    },
    {
      "code": 6069,
      "name": "lmsrPoolNotProvidedForVault",
      "msg": "LMSR pool context not provided when LMSR collateral vault is present."
    },
    {
      "code": 6070,
      "name": "insufficientPoolVaultBalanceForPayout",
      "msg": "Insufficient balance in the main pool vault for payout, and LMSR fallback not available or insufficient."
    },
    {
      "code": 6071,
      "name": "invalidLmsrPool",
      "msg": "Invalid LMSR Pool for operation"
    }
  ],
  "types": [
    {
      "name": "bet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "option",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "lpTokensMinted",
            "type": "u64"
          },
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "isPaidOut",
            "type": "bool"
          },
          {
            "name": "outcome",
            "type": {
              "defined": {
                "name": "betOutcome"
              }
            }
          },
          {
            "name": "tokenType",
            "type": {
              "defined": {
                "name": "tokenType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "betOutcome",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "won"
          },
          {
            "name": "lost"
          },
          {
            "name": "voided"
          },
          {
            "name": "draw"
          }
        ]
      }
    },
    {
      "name": "betPlaced",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "betId",
            "type": "u64"
          },
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "optionIndex",
            "type": "u64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "mintedAmount",
            "type": "u64"
          },
          {
            "name": "tokenType",
            "type": {
              "defined": {
                "name": "tokenType"
              }
            }
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "feePaid",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "bettingPoolsState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "betPointsMint",
            "type": "pubkey"
          },
          {
            "name": "nextPoolId",
            "type": "u64"
          },
          {
            "name": "nextBetId",
            "type": "u64"
          },
          {
            "name": "payoutFeeBp",
            "type": "u16"
          },
          {
            "name": "isInitialized",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "tradingFees",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "lmsrPayoutClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "originalPoolId",
            "type": "u64"
          },
          {
            "name": "lmsrPoolPda",
            "type": "pubkey"
          },
          {
            "name": "claimant",
            "type": "pubkey"
          },
          {
            "name": "lmsrTokenMintRedeemed",
            "type": "pubkey"
          },
          {
            "name": "collateralTokenType",
            "type": {
              "defined": {
                "name": "tokenType"
              }
            }
          },
          {
            "name": "tokensRedeemed",
            "type": "u64"
          },
          {
            "name": "payoutAmountCollateral",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "lmsrPool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "originalPoolId",
            "type": "u64"
          },
          {
            "name": "creatorAuthority",
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "pointsMint",
            "type": "pubkey"
          },
          {
            "name": "yesLmsrUsdcMint",
            "type": "pubkey"
          },
          {
            "name": "noLmsrUsdcMint",
            "type": "pubkey"
          },
          {
            "name": "yesLmsrPointsMint",
            "type": "pubkey"
          },
          {
            "name": "noLmsrPointsMint",
            "type": "pubkey"
          },
          {
            "name": "initialLiquidityYesUsdc",
            "type": "i64"
          },
          {
            "name": "initialLiquidityNoUsdc",
            "type": "i64"
          },
          {
            "name": "initialLiquidityYesPoints",
            "type": "i64"
          },
          {
            "name": "initialLiquidityNoPoints",
            "type": "i64"
          },
          {
            "name": "bUsdc",
            "type": "i64"
          },
          {
            "name": "initialQYesUsdc",
            "type": "i64"
          },
          {
            "name": "initialQNoUsdc",
            "type": "i64"
          },
          {
            "name": "initialPriceYesUsdc",
            "type": "i64"
          },
          {
            "name": "initialPriceNoUsdc",
            "type": "i64"
          },
          {
            "name": "actualMaxLossUsdc",
            "type": "i64"
          },
          {
            "name": "yesUsdcCurrentSupply",
            "type": "u64"
          },
          {
            "name": "noUsdcCurrentSupply",
            "type": "u64"
          },
          {
            "name": "yesPointsCurrentSupply",
            "type": "u64"
          },
          {
            "name": "noPointsCurrentSupply",
            "type": "u64"
          },
          {
            "name": "bPoints",
            "type": "i64"
          },
          {
            "name": "initialQYesPoints",
            "type": "i64"
          },
          {
            "name": "initialQNoPoints",
            "type": "i64"
          },
          {
            "name": "initialPriceYesPoints",
            "type": "i64"
          },
          {
            "name": "initialPriceNoPoints",
            "type": "i64"
          },
          {
            "name": "actualMaxLossPoints",
            "type": "i64"
          },
          {
            "name": "feesCollectedUsdc",
            "type": "u64"
          },
          {
            "name": "feesCollectedPoints",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "feeRateBasisPoints",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "lmsrSharesBought",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "originalPoolId",
            "type": "u64"
          },
          {
            "name": "lmsrPoolPda",
            "type": "pubkey"
          },
          {
            "name": "buyer",
            "type": "pubkey"
          },
          {
            "name": "outcomeIndex",
            "type": "u64"
          },
          {
            "name": "collateralTokenType",
            "type": {
              "defined": {
                "name": "tokenType"
              }
            }
          },
          {
            "name": "inputCollateralAmount",
            "type": "u64"
          },
          {
            "name": "feePaid",
            "type": "u64"
          },
          {
            "name": "lmsrTokensMinted",
            "type": "u64"
          },
          {
            "name": "lmsrTokenMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "lmsrSharesSold",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "originalPoolId",
            "type": "u64"
          },
          {
            "name": "lmsrPoolPda",
            "type": "pubkey"
          },
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "outcomeIndex",
            "type": "u64"
          },
          {
            "name": "collateralTokenType",
            "type": {
              "defined": {
                "name": "tokenType"
              }
            }
          },
          {
            "name": "collateralReceived",
            "type": "u64"
          },
          {
            "name": "feePaid",
            "type": "u64"
          },
          {
            "name": "lmsrTokensBurned",
            "type": "u64"
          },
          {
            "name": "lmsrTokenMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "mediaType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "x"
          },
          {
            "name": "tikTok"
          },
          {
            "name": "instagram"
          },
          {
            "name": "facebook"
          },
          {
            "name": "image"
          },
          {
            "name": "video"
          },
          {
            "name": "externalLink"
          }
        ]
      }
    },
    {
      "name": "payoutClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "betId",
            "type": "u64"
          },
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenType",
            "type": {
              "defined": {
                "name": "tokenType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "pool",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "id",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "array": [
                "string",
                2
              ]
            }
          },
          {
            "name": "betsCloseAt",
            "type": "i64"
          },
          {
            "name": "decisionTime",
            "type": "i64"
          },
          {
            "name": "usdcVolumeByOption",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "pointsVolumeByOption",
            "type": {
              "array": [
                "u64",
                2
              ]
            }
          },
          {
            "name": "yesUsdcSupply",
            "type": "u64"
          },
          {
            "name": "noUsdcSupply",
            "type": "u64"
          },
          {
            "name": "yesPointsSupply",
            "type": "u64"
          },
          {
            "name": "noPointsSupply",
            "type": "u64"
          },
          {
            "name": "winningOption",
            "type": "u64"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "poolStatus"
              }
            }
          },
          {
            "name": "isDraw",
            "type": "bool"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "mediaUrl",
            "type": "string"
          },
          {
            "name": "mediaType",
            "type": {
              "defined": {
                "name": "mediaType"
              }
            }
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "creatorName",
            "type": "string"
          },
          {
            "name": "creatorId",
            "type": "string"
          },
          {
            "name": "closureCriteria",
            "type": "string"
          },
          {
            "name": "closureInstructions",
            "type": "string"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "poolClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "selectedOption",
            "type": "u64"
          },
          {
            "name": "decisionTime",
            "type": "i64"
          },
          {
            "name": "isDraw",
            "type": "bool"
          },
          {
            "name": "winningOption",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "poolCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "question",
            "type": "string"
          },
          {
            "name": "options",
            "type": {
              "array": [
                "string",
                2
              ]
            }
          },
          {
            "name": "betsCloseAt",
            "type": "i64"
          },
          {
            "name": "mediaUrl",
            "type": "string"
          },
          {
            "name": "mediaType",
            "type": {
              "defined": {
                "name": "mediaType"
              }
            }
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "creatorName",
            "type": "string"
          },
          {
            "name": "creatorId",
            "type": "string"
          },
          {
            "name": "closureCriteria",
            "type": "string"
          },
          {
            "name": "closureInstructions",
            "type": "string"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "yesUsdcMint",
            "type": "pubkey"
          },
          {
            "name": "noUsdcMint",
            "type": "pubkey"
          },
          {
            "name": "yesPointsMint",
            "type": "pubkey"
          },
          {
            "name": "noPointsMint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "poolLockedAndAbleToMigrate",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "lockedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "poolMediaSet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "poolId",
            "type": "u64"
          },
          {
            "name": "mediaUrl",
            "type": "string"
          },
          {
            "name": "mediaType",
            "type": {
              "defined": {
                "name": "mediaType"
              }
            }
          }
        ]
      }
    },
    {
      "name": "poolMigratedToLmsr",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "originalPoolId",
            "type": "u64"
          },
          {
            "name": "lmsrPoolPda",
            "type": "pubkey"
          },
          {
            "name": "creatorAuthority",
            "type": "pubkey"
          },
          {
            "name": "usdcMint",
            "type": "pubkey"
          },
          {
            "name": "pointsMint",
            "type": "pubkey"
          },
          {
            "name": "yesLmsrUsdcMint",
            "type": "pubkey"
          },
          {
            "name": "noLmsrUsdcMint",
            "type": "pubkey"
          },
          {
            "name": "yesLmsrPointsMint",
            "type": "pubkey"
          },
          {
            "name": "noLmsrPointsMint",
            "type": "pubkey"
          },
          {
            "name": "initialLiquidityYesUsdc",
            "type": "u64"
          },
          {
            "name": "initialLiquidityNoUsdc",
            "type": "u64"
          },
          {
            "name": "initialLiquidityYesPoints",
            "type": "u64"
          },
          {
            "name": "initialLiquidityNoPoints",
            "type": "u64"
          },
          {
            "name": "feeRateBasisPoints",
            "type": "u16"
          },
          {
            "name": "migrationTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "poolStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "none"
          },
          {
            "name": "pending"
          },
          {
            "name": "graded"
          },
          {
            "name": "regraded"
          },
          {
            "name": "locked"
          },
          {
            "name": "migrated"
          }
        ]
      }
    },
    {
      "name": "tokenType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "usdc"
          },
          {
            "name": "points"
          }
        ]
      }
    }
  ]
};
