self.addEventListener('push', function(e) {
 const data=e.data.json();
 self.registration.showNotification(data.title,{
 	body:data.body,
 	//all parameters here
 	//https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/showNotification
 })
});