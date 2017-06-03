var expect = require("chai").expect;
var tenuki = require("../index.js");
var Game = tenuki.Game;

describe("ko restriction", function() {
  it("prevents simple ko by default", function() {
    var game = new Game();
    game.setup();

    expect(game.playAt(3, 3)).to.be.true; // b
    expect(game.playAt(3, 2)).to.be.true; // w
    expect(game.playAt(4, 2)).to.be.true; // b
    expect(game.playAt(4, 1)).to.be.true; // w
    expect(game.playAt(5, 3)).to.be.true; // b
    expect(game.playAt(5, 2)).to.be.true; // w
    expect(game.playAt(4, 4)).to.be.true; // b
    expect(game.playAt(4, 3)).to.be.true; // w

    expect(game.intersectionAt(4, 2).isEmpty()).to.be.true;
    expect(game.playAt(4, 2)).to.be.false;
    expect(game.isIllegalAt(4, 2)).to.be.true;

    expect(game.playAt(10, 10)).to.be.true; // b

    expect(game.isIllegalAt(4, 2)).to.be.false; // w
    expect(game.playAt(4, 2)).to.be.true;
  });

  it("is removed by a pass", function() {
    var game = new Game();
    game.setup();

    expect(game.playAt(3, 3)).to.be.true; // b
    expect(game.playAt(3, 2)).to.be.true; // w
    expect(game.playAt(4, 2)).to.be.true; // b
    expect(game.playAt(4, 1)).to.be.true; // w
    expect(game.playAt(5, 3)).to.be.true; // b
    expect(game.playAt(5, 2)).to.be.true; // w
    expect(game.playAt(4, 4)).to.be.true; // b
    expect(game.playAt(4, 3)).to.be.true; // w

    expect(game.intersectionAt(4, 2).isEmpty()).to.be.true;
    expect(game.playAt(4, 2)).to.be.false;
    expect(game.isIllegalAt(4, 2)).to.be.true;

    expect(game.pass()).to.be.true; // b

    expect(game.isIllegalAt(4, 2)).to.be.false; // w
    expect(game.playAt(4, 2)).to.be.true;
  });

  it("is undone by an undo", function() {
    var game = new Game();
    game.setup();

    expect(game.playAt(0, 0)).to.be.true; // b
    expect(game.playAt(0, 1)).to.be.true; // w
    expect(game.playAt(1, 1)).to.be.true; // b
    expect(game.playAt(1, 0)).to.be.true; // w
    expect(game.playAt(0, 2)).to.be.true; // b
    expect(game.playAt(1, 2)).to.be.true; // w
    expect(game.playAt(0, 0)).to.be.true; // b

    expect(game.intersectionAt(0, 1).isEmpty()).to.be.true;
    expect(game.isIllegalAt(0, 1)).to.be.true;

    game.undo();

    expect(game.intersectionAt(0, 1).isEmpty()).to.be.false;
    expect(game.intersectionAt(0, 1).isWhite()).to.be.true;
  });

  describe("with positional superko rules", function() {
    it("prevents repeating a previous position", function() {
      var game = new Game();
      game.setup({ koRule: "superko" });

      // cycle for ● repeatedly losing 2 stones
      // ┌─●─┬─○─●
      // ●─○─○─○─●
      // ●─┼─○─●─●
      // ○─○─○─●─┼
      // ●─●─●─●─┼
      game.playAt(0, 3); // b
      game.playAt(0, 4); // w
      game.playAt(1, 3); // b
      game.playAt(1, 4); // w
      game.playAt(1, 2); // b
      game.playAt(2, 4); // w
      game.playAt(1, 1); // b
      game.playAt(2, 3); // w
      game.playAt(2, 2); // b
      game.playAt(3, 3); // w
      game.playAt(3, 2); // b
      game.playAt(4, 3); // w
      game.playAt(3, 1); // b
      game.playAt(4, 2); // w
      game.playAt(3, 0); // b
      game.playAt(4, 1); // w
      game.playAt(0, 8); // b tenuki
      game.playAt(4, 0); // w
      game.playAt(1, 8); // b tenuki
      game.playAt(0, 1); // w
      game.playAt(2, 8); // b tenuki
      game.playAt(1, 0); // w
      game.playAt(3, 8); // b tenuki
      game.playAt(2, 0); // w
      game.playAt(4, 8); // b tenuki -- (*)
      game.playAt(0, 2); // w

      expect(game.playAt(0, 0)).to.be.true; // b

      expect(game.playAt(0, 1)).to.be.false; // w -- this move is not allowed with superko since it repeats (*)
      expect(game.isIllegalAt(0, 1)).to.be.true;
      expect(game.intersectionAt(0, 1).value).to.equal("empty");
      expect(game.currentPlayer()).to.equal("white");
      expect(game.currentState().playedPoint.y).to.equal(0);
      expect(game.currentState().playedPoint.x).to.equal(0);
    });

    it("prevents repetition with a triple ko", function() {
      var game = new Game();
      game.setup({ koRule: "superko" });

      var ponnukiOffsets = [
        [-1, 1],
        [0, 0],
        [1, 1],
        [0, 2]
      ];

      // ko points
      [
        [4, 4],  // ko A
        [4, 9], // ko B
        [7, 6]   // ko C (*)
      ].forEach(([koY, koX]) => {
        ponnukiOffsets.forEach(([yOffset, xOffset]) => {
          // b
          expect(game.playAt(koY + yOffset, koX + xOffset)).to.be.true;
          // w (capturing the ko for the last offset)
          expect(game.playAt(koY + yOffset, koX + xOffset - 1)).to.be.true;
        });
      });

      // black recaptures ko A
      expect(game.playAt(4, 4)).to.be.true; // b
      // white tenuki
      expect(game.playAt(2, 7)).to.be.true; // w

      // 3 kos, clockwise: (A) black, (B) white, (C) white

      expect(game.playAt(4, 9)).to.be.true;  // b: ko B -> black
      expect(game.playAt(4, 5)).to.be.true;  // w: ko A -> white
      expect(game.playAt(7, 6)).to.be.true;  // b: ko C -> black
      expect(game.playAt(4, 10)).to.be.true; // w: ko B -> white
      expect(game.playAt(4, 4)).to.be.true;  // b: ko A -> black

      // kos are now: (A) black, (B) white, (C) black

      // not allowed, since it would change ko C to white, leading to a repetition of (*)
      expect(game.playAt(7, 7)).to.be.false;
      expect(game.isIllegalAt(7, 7)).to.be.true;
      expect(game.intersectionAt(7, 7).value).to.equal("empty");
      expect(game.intersectionAt(7, 6).value).to.equal("black");
      expect(game.currentPlayer()).to.equal("white");
      expect(game.currentState().playedPoint.y).to.equal(4);
      expect(game.currentState().playedPoint.x).to.equal(4);
    });
  });
});

