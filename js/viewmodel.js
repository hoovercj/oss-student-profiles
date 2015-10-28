var ISSUES_URL = "https://api.github.com/repos/open-source-society/computer-science/issues";
var converter = new showdown.Converter();
converter.setOption('tables', true);

function StudentProfile(student) {
	var self = this;	
	self.name = student['user']['login'];
	self.avatarUrl = student['user']['avatar_url'];
    self.body = student['body'];
    
	self.bodyHtml = converter.makeHtml(student['body']);
}

var ViewModel = function() {
	var self = this;

    self.searchTerm = ko.observable();
    self.allStudents = ko.observableArray([]);
    self.students = ko.observableArray([]);
    self.query = ko.observable('');
    
    $.getJSON(ISSUES_URL, function (data) {
        var issue_urls = data.map( function (issue) {
            return issue.comments_url;
        });
        issue_urls.forEach( function(issue_url) {
            self.getIssues(issue_url);
        });
    });
    
    self.getIssues = function(issue_url) {
        $.getJSON(issue_url + '?callback=?', function(resp) {
            data = resp.data;
            if (data) {
                data.shift();
                data.forEach(function (student) {
                    self.allStudents.push(new StudentProfile(student));
                    self.students.push(new StudentProfile(student))
                });
            } 
                        
            meta = resp.meta;
            if (meta && meta.Link && meta.Link[0]) {
                self.getIssues(meta.Link[0]);
            }
        });        
    }
    
    self.search = function(value) {
        self.students.removeAll();        
        self.allStudents().forEach( function(student) {
            if (value == '' || student.body.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                self.students.push(student);
            }
        });
    }    
}

var issuesCallback = function(meta, data) {
    data.shift();
    data.forEach(function (student) {
        viewModel.students.push(new StudentProfile(student));
    }); 
}

var viewModel = new ViewModel();
viewModel.query.subscribe(viewModel.search);
ko.applyBindings(viewModel);
