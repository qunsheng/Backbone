/************************************************************** 
 * 
 * This is main JavaScript file using backbone.js
 * 
 **************************************************************/ 
 
/************************************************************** 
 * 
 * Preventing Cross Site Scripting (XSS)
 * As always you need to protect your users by encoding input and output, 
 * here is a simple methods for doing so.
 * 
 **************************************************************/ 
function htmlEncode(value){
      return $('<div/>').text(value).html();
}

/************************************************************** 
 * 
 * jQuery SerializeObject
 * Convert our forms into Javascript Object.
 * Simply call it via $(form).serializeObject() 
 * and get a object returned.
 * 
 **************************************************************/ 
$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  return o;
}

/************************************************************** 
 * 
 * Ajax Prefilter
 * Ajax prefilters are useful for hooking into all AJAX request. 
 * 
 **************************************************************/ 
$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
  options.url = 'http://localhost:3000' + options.url;
});

var Users = Backbone.Collection.extend({
  url: '/users'
});
  
var User = Backbone.Model.extend({
  urlRoot: '/users'
});

// View 
var UserListView = Backbone.View.extend({
  el: '.page',
  render: function () {
  	// save this scope for using in anonyous function later
    var that = this;
    var users = new Users();
    users.fetch({
      success: function (users) {
        var template = _.template($('#user-list-template').html(), {users: users.models});
        that.$el.html(template);
      }
    })
  }
});


var UserEditView = Backbone.View.extend({
  el: '.page',
  events: {
    'submit .edit-user-form': 'saveUser',
    'click .delete': 'deleteUser'
  },
  saveUser: function (ev) {
    var userDetails = $(ev.currentTarget).serializeObject();
    var user = new User();
    user.save(userDetails, {
      success: function (user) {
        router.navigate('', {trigger:true});
      }
    });
    return false;
  },
  deleteUser: function (ev) {
    this.user.destroy({
      success: function () {
        console.log('destroyed');
        router.navigate('', {trigger:true});
      }
    });
    return false;
  },
  render: function (options) {
    var that = this;
    if(options.id) {
      that.user = new User({id: options.id});
      that.user.fetch({
        success: function (user) {    
          var template = _.template($('#edit-user-template').html(), {user: user});
          that.$el.html(template);
        }
      })
    } else {
      var template = _.template($('#edit-user-template').html(), {user: null});
      that.$el.html(template);
    }
  }
});


// View instance
var userListView = new UserListView();
var userEditView = new UserEditView();

// Router
var Router = Backbone.Router.extend({
        routes: {
          "": "home", 
          "edit/:id": "edit",
          "new": "edit",
        }
 });

 // Router instance
 var router = new Router;
 
 // Event handler for home
 router.on('route:home', function() {
    console.log("we have loaded home page");
      // render user list
    userListView.render();
 })

 // event handler for edit
 router.on('route:edit', function(id) {
	console.log("we have loaded edit page");
    userEditView.render({id: id});
 })
 
 // handle page back forth
 Backbone.history.start();
 
