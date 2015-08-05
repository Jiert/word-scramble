var AppView = Backbone.View.extend({

  template: '<span id="unscrambled"></span><span id="scrambled"></span><div id="score">Completed: <span>0</span></div>',

  initialize: function(){
    _(this).bindAll('render', 'scramble', 'renderLetter', 'onKeyDown', 'getWord');
    this.model = new WordModel();
    this.score = 0;
    this.render();
  },

  getWord: function(){
    this.model.fetch({
      data: {
        hasDictionaryDef: true,
        excludePartOfSpeech: 'proper-noun,abbreviation',
        includePartOfSpeech: 'noun,adjective,verb',
        minCorpusCount: 30000,
        maxCorpusCount: -1,
        minDictionaryCount: 1,
        maxDictionaryCount:-1,
        minLength: 4,
        maxLength: 6,
        api_key: 'c2571d1d483030901b10a0ebe690822b33203e0fc71e9c57c'
      },
      success: this.scramble
    });
  },

  onKeyDown: function(event){
    event.preventDefault();
    var letter, index;

    // if backspace
    if (event.keyCode == 8 && this.indicies.length){

      // get last letter and index
      letter = _(this.unscrambled).last();
      index = _(this.indicies).last();

      // remove last letter and index
      this.unscrambled.pop();
      this.indicies.pop();

      // put everything back where it was
      this.scrambled.splice(index, 0, letter);

      // and then re-render
      this.renderArrays();
    }
    else {
      letter = String.fromCharCode(event.keyCode);
      
      if(_(this.scrambled).contains(letter)){

        // pull the letter out of scrambled
        index = _(this.scrambled).indexOf(letter);
        this.scrambled.splice(index, 1);

        // store index and letter
        this.indicies.push(index);
        this.unscrambled.push(letter);

        // re-render and see if we've won
        this.renderArrays();
        this.checkWin();
      }
    }
  },

  checkWin: function(){
    if (this.unscrambled.join('') === this.word){
      this.$('#unscrambled span').addClass('win');
      this.$('#score span').html(++this.score);
      _(this.getWord).delay(1000);
    }
    else if (this.unscrambled.length === this.word.length){
      this.$('#unscrambled span').addClass('error');
    }
  },

  scramble: function(){
    this.word = this.model.get('word').toUpperCase();

    // create scrambled word
    this.scrambled = _.chain(this.word).toArray().shuffle().value();

    // unscrambled letters
    this.unscrambled = [];

    // indicies for restoring scrambled letters
    this.indicies = [];

    this.renderArrays();
  },

  renderArrays: function(){
    this.$unscrambled.html('');
    this.$scrambled.html('');

    _(this.unscrambled).each(function(letter){
      this.renderLetter(letter, this.$unscrambled);
    }, this);

    _(this.scrambled).each(function(letter){
      this.renderLetter(letter, this.$scrambled);
    }, this);
  },

  renderLetter: function(letter, el){
    el.append('<span>'+letter+'</span>');
  },

  render: function(){
    this.$el.html(this.template);

    this.$scrambled = this.$('#scrambled');
    this.$unscrambled = this.$('#unscrambled');

    this.getWord();

    $(window).on('keydown', this.onKeyDown);

    return this;
  }

});

var WordModel = Backbone.Model.extend({
  url: 'http://api.wordnik.com:80/v4/words.json/randomWord',
});

var app = new AppView({ el: '#app' });