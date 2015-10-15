$('#post-form').hide();
$('#edit-post-form').hide();

var postInstance = {
  edit: false,
  title: '',
  body: '',
  date: '',
  id: ''
};

var showPostList = function() {
  $('#post-list').empty();
  $.getJSON('/posts', function(data) {
    $.each(data, function() {
      $('#post-list').append('<div class="post-box post-' + this.id + '"><h3 class="post-title" data-tooltip="edit this post"><a href="#" onclick="editPost(' + this.id + ')">' + this.title + '</a><small class="post-date">' + this.date + '</small></h3><div class="post-content hide">' + this.content + '</div></div>');
    });
  });
};

showPostList();

var postData;
var send = function() {
  if (postInstance.edit) {
    $.ajax({
      type: "Put",
      url: "/posts/"+postInstance.id,
      data: postData,
      dataType: JSON
    });
  }else{
    $.ajax({
      type: "POST",
      url: "/posts",
      data: postData,
      dataType: JSON
    });
  }
};

var newPost = function() {
  postInstance.edit = false;
  postInstance.id = '';
  $('#new-post-button').fadeOut();
  $('#post-form').fadeIn();
  postInstance.body = "Write something wonderful...";
  tinyMCE.activeEditor.setContent(postInstance.body);
  jsonEditor.content = postInstance.body;
  jsonEditor.title = "Enter Title";
  jsonEditor.init();
};

var closeNewPost = function() {
  $('#new-post-button').fadeIn();
  $('#post-form').fadeOut();
  jsonEditor.content = "";
  jsonEditor.title = "";
  jsonEditor.init();
};

var editPost = function(id) {
  postInstance.edit = true;
  postInstance.id = id;
  postInstance.title = $('.post-'+id+' h3 a')[0].text;
  postInstance.body = $('.post-'+id+' .post-content').html();
  tinyMCE.activeEditor.setContent(postInstance.body);
  $('#post-form').fadeIn();
  jsonEditor.content = postInstance.body;
  jsonEditor.title = postInstance.title;
  jsonEditor.init();
};



var jsonEditor = (function(){

  var JE = {};
  JE.init = function(){
    this.pre = document.querySelector(".preview");
    this.titleInput = document.querySelector(".title");
    this.contentInput = document.querySelector(".content");
    if (postInstance.edit) {
      this.title = this.title || postInstance.title;
    }else{
      this.title = this.title || "Enter Title";
    }
    if (postInstance.edit) {
      this.content = this.content || postInstance.body;
    }else{
      this.content = this.content || "<p>Write something nice...</p>";
    }
    this.date = this.getDate();
    this.titleInput.value = this.title;
    this.contentInput.value = this.content;

    this.tinymce = this.runTinymce();
    this.binding();
    this.showJson();

 };


  JE.binding = function(){
    this.titleInput.addEventListener("keyup", this.titleChange);
  };

  // handler for title keyup
  JE.titleChange = function(){
     var that = JE;
     that.title = this.value;
     that.showJson();
  };

  // format a date like April 20, 2014
  JE.getDate = function(){
    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth();
    var year = d.getFullYear();
    return months[month] + " " + day + ", " + year;
  };

  // passing content from tinymce event
  JE.contentChange = function(content){
     this.content = content;
     this.showJson();
  };

  // updates json
  JE.showJson = function(){
    this.pre.innerHTML = this.content.replace(/<|>/g, function(chr){
        return chr == "<" ? "&lt;" : "&gt;";
    });
    postData = (this.makeJson());
  };

  JE.makeJson = function(){
     // replace newline char with nothing
    this.content = this.content.replace(/\n/g, "");
    var json = this.makePost.call(this);
    // JSON.stringify(this.makePost.call(this), null, " ");
    return json;
  };
  // make a post object
  JE.makePost = function(){
    var title = this.title;
    var content = this.content;
    var date = this.date;
    return {
      post:
      {
        date: date,
        title: title,
        content: content
      }
    };
  };

  // run tinymce.
  JE.runTinymce = function(){
    var that = this;
    tinymce.init({
      selector: ".content",
      plugins: "code, link, fullscreen, preview, image",
      setup: function(ed){
        ed.on("keyup", function(){
          that.contentChange(this.getContent());
        });
      }
    });

    return tinymce;
  };

  return JE;
})();

jsonEditor.init();
