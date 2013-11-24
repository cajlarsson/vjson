# vjson - versioned javascript objects #

This is a library for synchronizing large json objects when you don't exaclty 
what was updated. It is intended for master slave synchronization. The master
can generate a minimal delta for any slave if it knows its current revision. 
Revisions are managed on all dictonary type objects. It is possible to add a
hook function for any versioned object, that will be called if the version is 
updated. 

TODO: Better documentation and a possibly a mutator for maintaing the structure.