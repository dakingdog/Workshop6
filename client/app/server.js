import { readDocument, writeDocument, addDocument, deleteDocument, getCollection } from './database.js';

/**
 * Emulates how a REST call is *asynchronous* -- it calls your function back
 * some time in the future with data.
 */
function emulateServerReturn(data, cb) {
  setTimeout(() => {
    cb(data);
  }, 4);
}
var token = 'eyJpZCI6NH0=';
/*global FacebookError*/
function sendXHR(verb, resource, body, cb) {
  var xhr = new XMLHttpRequest();
  xhr.open(verb, resource);
  xhr.setRequestHeader('Authorization', 'Bearer ' + token);
  xhr.addEventListener('load', function() {
    var statusCode = xhr.status;
    var statusText = xhr.statusText;
    if (statusCode >= 200 && statusCode < 300) {
      cb(xhr);
    } else {
      var responseText = xhr.responseText;
      FacebookError('Could not' + verb + " " + resource + ": Received " + statusCode + " " + statusText + ": " + responseText);
    }
  });
  // Time out the request if it takes longer than 10,000
  // milliseconds (10 seconds)
  xhr.timeout = 10000;
  // Network failure: Could not connect to server.
  xhr.addEventListener('error', function() {
    FacebookError('Could not ' + verb + " " + resource +
      ": Could not connect to the server.");
  });
  // Network failure: request took too long to complete.
  xhr.addEventListener('timeout', function() {
    FacebookError('Could not ' + verb + " " + resource +
      ": Request timed out.");
  });
  switch (typeof (body)) {
    case 'undefined':
      // No body to send.
      xhr.send();
      break;
    case 'string':
      // Tell the server we are sending text.
      xhr.setRequestHeader("Content-Type", "text/plain;charset=UTF-8");
      xhr.send(body);
      break;
    case 'object':
      // Tell the server we are sending JSON.
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      // Convert body into a JSON string.
      xhr.send(JSON.stringify(body));
      break;
    default:
      throw new Error('Unknown body type: ' + typeof (body));
  }
}
/**
 * Resolves a feed item. Internal to the server, since it's synchronous.
 */
function getFeedItemSync(feedItemId) {
  var feedItem = readDocument('feedItems', feedItemId);
  // Resolve 'like' counter.
  feedItem.likeCounter = feedItem.likeCounter.map((id) => readDocument('users', id));
  // Assuming a StatusUpdate. If we had other types of FeedItems in the DB, we would
  // need to check the type and have logic for each type.
  feedItem.contents.author = readDocument('users', feedItem.contents.author);
  // Resolve comment author.
  feedItem.comments.forEach((comment) => {
    comment.author = readDocument('users', comment.author);
  });
  return feedItem;
}

/**
 * Emulates a REST call to get the feed data for a particular user.
 */
export function getFeedData(user, cb) {
  sendXHR('GET', 'user/4/feed', undefined, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Adds a new status update to the database.
 */
export function postStatusUpdate(user, location, contents, cb) {
  // If we were implementing this for real on an actual server, we would check
  // that the user ID is correct & matches the authenticated user. But since
  // we're mocking it, we can be less strict.
  sendXHR('POST', '/feeditem', {
    userId: user,
    location: location,
    contents: contents
  }, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  }
  );
}

/**
 * Adds a new comment to the database on the given feed item.
 */
export function postComment(feedItemId, author, contents, cb) {
  sendXHR('POST', '/feeditem/'+feedItemId+'/CommentThread', {
    author: author,
    contents: contents
  },
  (xhr)=>{cb(JSON.parse(xhr.responseText))}
  );
  // var feedItem = readDocument('feedItems', feedItemId);
  // feedItem.comments.push({
  //   "author": author,
  //   "contents": contents,
  //   "postDate": new Date().getTime(),
  //   "likeCounter": []
  // });
  // writeDocument('feedItems', feedItem);
  // // Return a resolved version of the feed item.
  // emulateServerReturn(getFeedItemSync(feedItemId), cb);
}

/**
 * Updates a feed item's likeCounter by adding the user to the likeCounter.
 * Provides an updated likeCounter in the response.
 */
/**
* Updates a feed item's likeCounter by adding the user to the likeCounter.
* Provides an updated likeCounter in the response.
*/
export function likeFeedItem(feedItemId, userId, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/likelist/' + userId,
    undefined, (xhr) => {
      cb(JSON.parse(xhr.responseText));
    });
}
/**
 * Updates a feed item's likeCounter by removing the user from the likeCounter.
 * Provides an updated likeCounter in the response.
 */
/**
* Updates a feed item's likeCounter by removing the user
* from the likeCounter. Provides an updated likeCounter
* in the response.
*/
export function unlikeFeedItem(feedItemId, userId, cb) {
  sendXHR('DELETE', '/feeditem/' + feedItemId + '/likelist/' + userId,
    undefined, (xhr) => {
      cb(JSON.parse(xhr.responseText));
    });
}

/**
 * Adds a 'like' to a comment.
 */
export function likeComment(feedItemId, commentIdx, userId, cb) {
  sendXHR('PUT', '/feeditem/'+feedItemId+'/CommentThread/'+commentIdx+'/likelist/'+userId, 
    undefined, (xhr)=>{
      cb(JSON.parse(xhr.responseText));
    });

  // var feedItem = readDocument('feedItems', feedItemId);
  // var comment = feedItem.comments[commentIdx];
  // comment.likeCounter.push(userId);
  // writeDocument('feedItems', feedItem);
  // comment.author = readDocument('users', comment.author);
  // emulateServerReturn(comment, cb);
}

/**
 * Removes a 'like' from a comment.
 */
export function unlikeComment(feedItemId, commentIdx, userId, cb) {
  sendXHR('DELETE', '/feeditem/'+feedItemId+'/CommentThread/'+commentIdx+'/likelist/'+userId, 
    undefined, (xhr)=>{
      cb(JSON.parse(xhr.responseText));
    });
  // var feedItem = readDocument('feedItems', feedItemId);
  // var comment = feedItem.comments[commentIdx];
  // var userIndex = comment.likeCounter.indexOf(userId);
  // if (userIndex !== -1) {
  //   comment.likeCounter.splice(userIndex, 1);
  //   writeDocument('feedItems', feedItem);
  // }
  // comment.author = readDocument('users', comment.author);
  // emulateServerReturn(comment, cb);
}

/**
 * Updates the text in a feed item (assumes a status update)
 */
export function updateFeedItemText(feedItemId, newContent, cb) {
  sendXHR('PUT', '/feeditem/' + feedItemId + '/content', newContent, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}

/**
 * Deletes a feed item.
 */
export function deleteFeedItem(feedItemId, cb) {
  // Assumption: The current user authored this feed item.
  sendXHR('DELETE', '/feeditem/' + feedItemId, undefined, () => {
    cb();
  })
}

/**
 * Searches for feed items with the given text.
 */
/**
* Searches for feed items with the given text.
*/
export function searchForFeedItems(userID, queryText, cb) {
  // userID is not needed; it's included in the JSON web token.
  sendXHR('POST', '/search', queryText, (xhr) => {
    cb(JSON.parse(xhr.responseText));
  });
}
