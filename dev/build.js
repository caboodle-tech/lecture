const DevBuilder = require('./builder');

const builder = new DevBuilder();

builder.registerJs('CtlLectures', 'plugins/ctl-lectures.js');
builder.registerJs('CtlMath', 'plugins/ctl-math.js');
builder.registerJs('CtlMermaid', 'plugins/ctl-mermaid.js');

builder.registerScss('reveal.scss');
builder.registerScss('themes/ctl/ctl.scss');

builder.build();
