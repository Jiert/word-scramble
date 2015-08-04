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
        excludePartOfSpeech: 'proper-noun',
        minCorpusCount: 20000,
        maxCorpusCount: 30000,
        minDictionaryCount: 1,
        maxDictionaryCount:-1,
        minLength: 5,
        maxLength: 7,
        api_key: 'a2a73e7b926c924fad7001ca3111acd55af2ffabf50eb4ae5'
      },
      success: this.scramble
    });
  },

  onKeyDown: function(event){
    event.preventDefault();
    var letter, index;

    if (event.keyCode == 8 && this.indicies.length){

      // get last letter of unscrambled
      letter = _(this.unscrambled).last();

      // remove last letter of unscrambled
      this.unscrambled.pop();

      // get last index indicies
      index = _(this.indicies).last();

      // remove last index indicies
      this.indicies.pop();

      // put it back into scrambled at the correct index
      this.scrambled.splice(index, 0, letter);

      this.renderArrays();
    }
    else {
      letter = String.fromCharCode(event.keyCode);
      
      if(_(this.scrambled).contains(letter)){

        // pull the letter out of scrambled
        index = _(this.scrambled).indexOf(letter);
        this.scrambled.splice(index, 1);

        // store index
        this.indicies.push(index);

        // put the letter in unscrambled
        this.unscrambled.push(letter);

        // re-render everything
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

    // set up srambled word array
    this.scrambled = _.chain(this.word).toArray().shuffle().value();

    // create an array to store unscrambled attempts
    this.unscrambled = [];

    // create an array of indicies for restoring scrambled letters
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