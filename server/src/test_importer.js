var testModule=require('./test_module');
var Foo=testModule.Foo;
var Bar=require('./test_default_module');
Foo();
Bar();
