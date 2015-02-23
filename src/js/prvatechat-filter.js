// Filter to filter private messages between users
angular.module('angularChat').
filter('prvtChat', function() {
    return function(messages, sender, reciever) {
        var out = [];
        for(var i = 0; i < messages.length; i++) {
            if(messages[i].prvt) {
                // Filter out messages that are not between the sender and reciever
                if((messages[i].nick === sender && messages[i].recipient === reciever) || 
                    (messages[i].recipient === sender && messages[i].nick === reciever)) {
                    out.push(messages[i]);
                }
            }
        }
        return out;
    };
});
