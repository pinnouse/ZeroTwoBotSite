var filteredCommands = new Map();

Vue.component('command-list', {
  template: '#grid-template',
  props: {
    columns: Array,
    commands: Array,
    filterKey: String
  },
  computed: {
    filteredCommandList: function() {
      var commands = this.commands;
      var filterKey = this.filterKey && this.filterKey.toLowerCase();

      if (filterKey) {
        commands = commands.filter(cmd => {
          return cmd.aliases.some(val => { return val.toLowerCase().includes(this.filterKey.toLowerCase())}).length > 0
          || cmd.category.toLowerCase().indexOf(filterKey) > -1
          || cmd.description.toLowerCase().indexOf(filterKey) > -1
          || cmd.usage.toLowerCase().indexOf(filterKey) > -1;
        });
      }
      return commands;
    }
  }
});

let categories = Array.from(commands.keys());

var commandsApp = new Vue({
  el: '#commands',
  data: {
    searchQuery: '',
    categories: categories,
    columns: ['Name', 'Description', 'Usage'],
    commandList: getCommands(filteredCommands)
  },
  methods: {
    addCategory: function(category) {
      if (!filteredCommands.has(category)) {
        filteredCommands.set(category, commands.get(category));
        $('.' + category.replace('!', '')).addClass('selected');
      } else {
        filteredCommands.delete(category);
        $('.' + category.replace('!', '')).removeClass('selected');
      }

      commandsApp.commandList = getCommands(filteredCommands);
    }
  }
});

function getCommands(commands) {
  var styledCommands = [];
  for (let [cat, cmdList] of commands.entries()) {
    cmdList.forEach(el => {
      let superCmds = (el.superCmd && el.superCmd.length > 0) ? el.superCmd : [""];
      el.usage = "";
      superCmds.forEach((superCmd, i) => {

        el.aliases.forEach((alias, j) => {
          if (i > 0 || j > 0) el.usage += "<br />"
          el.usage += "<div><span style=\"color: #d04f65;\">";
          el.usage += prefix;
          if (superCmd !== "") el.usage += superCmd + " ";
          el.usage += alias;
          el.usage += "</span>";
    
          let args = "";
          if (el.reqArgs && el.reqArgs.length > 0) {
            args += " <span>&lt;";
            args += el.reqArgs.join("&gt;</span> <span>&lt;");
            args += "&gt;</span>";
          }
          if (el.optArgs && el.optArgs.length > 0) {
            args += " <span>[";
            args += el.optArgs.join("]</span> <span>[");
            args += "]</span>";
          }
          el.usage += args;
          el.usage += "</div>";
        });
        el.category = cat;
        
      });
      styledCommands.push(el);
    });
  };
  return styledCommands;
}

$(() => {
  function scrollCheck() {
    if ($(window).scrollTop() > $('nav').height() * 2) $('header').addClass("color");
    else $('header').removeClass("color");

    if ($(window).scrollTop() > $('nav').height() + $('thead').height())
      $('table').addClass('scrolled');
    else
      $('table').removeClass('scrolled');
  }

  $(window).scroll(scrollCheck);

  scrollCheck();
});