---
layout: chapter
title: 第五章 完善布局
---

学习了[第四章](chapter4.html)，我们对 Ruby 也大概了解了，也晓得怎么把样式表引入程序里了，不过，在[4.3.4 节](chapter4.html#sec-4-3-4)里就说过了，这个样式表里还什么都没有呢，不过不用怕，这一切都将在这一章改变。在这一章我们会引入一个叫 Bootstrap 的框架，然后再添加一些自定义的样式。[^1]当然了，之前做的那些页面（“Home”、”Help“ 和 ”About“），肯定也会被添加进来的[5.1 节](#sec-5-1)。顺便我们还要学习 partials、Rails 路由和 asset pipeline，甚至还会包括一点点 Sass 的内容[5.2 节](#sec-5-2)，[第三章](chapter3.html)的那些测试也需要重构，最后我们还要实现一个注册的功能。

<h2 id="sec-5-1">5.1 添加一些结构</h2>

虽然说，这是一本关于 Web 开发而不是 Web 设计的书，但是如果知道自己开发的只能是个12306一样的东西，那这绝对不是什么振奋人心的消息。所以，在这一部分我们要添加一些必要的部分，然后用 CSS 来让样式更漂亮一点。不过我们并不只是手写 CSS，还会使用一个由 Twitter 开发的开源 Web 设计框架 [Bootstrap](http://twitter.github.com/bootstrap/)。另外，会用到 partials 技术来让代码更整洁。

在Web 开发中，对用户界面尽早做出规划，对于开发是很有帮助的。后面我会经常插入构思图（在网页领域一般叫做“线框图”），其实也就是设想的应用最后大概会长成什么样的草图。[^2]这节我们主要是开发[3.1 节](chapter3.html#sec-3.1)中的静态页面，里面会包含一个网站LOGO、头部导航条和网页底部。[图 5.1](#figure-5-1)是 Home 页面的构思图，很明显这是最重要的页面。[图 5.7](#figure-5-7)是最终完成后的样子，虽然和构思的不太一样，比如，页面里有一个 Rails 的 LOGO，不过这也没什么大不了的，构思图嘛，没必要太准确。

<p id="figure-5-1">![home_page_mockup_bootstrap](assets/images/figures/home_page_mockup_bootstrap.png)

图 5.1：示例程序“首页”的构思图

照旧，如果你是用 Git 做版本控制的话，是时候创建一个新的分支了：

{% highlight sh %}
$ git checkout -b filling-in-layout
{% endhighlight %}

<h3 id="sec-5-1-1">5.1.1 网站导航</h3>

在示例程序中加入连接和样式的第一步，我们要修改布局文件 `application.html.erb`（上次使用是在代码 4.3 中），添加一些 HTML 结构。我们要添加一些区域，一些 CSS class，以及网站导航。布局文件的内容参见代码 5.1，对各部分代码的说明紧跟其后。如果你迫不及待的想看到结果，请查看图 5.2。（注意：结果（还）不是很让人满意。）
要在示例程序中添加链接和样式，首先我们要给 `application.html.erb` 这个文件（上次见到它是在[代码 4.3]里）增加一些 HTML 结构。添加一些区域、一些 CSS 类、以及网站导航条。这个文件的全部内容在[代码 5.1](#list-5-1)中，下面我们会对各部分代码进行解释，如果你实在等不及，[图 5.2](#figure-5.2)是最终结果。（注：虽然是最终结果，但其实不是那么让人满意）

<p id="list-5-1">**代码 5.1**<p> 添加一些结构后的网站布局文件 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", media: "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
    <!--[if lt IE 9]>
    <script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
    <![endif]-->
  </head>
  <body>
    <header class="navbar navbar-fixed-top">
      <div class="navbar-inner">
        <div class="container">
          <%= link_to "sample app", '#', id: "logo" %>
          <nav>
            <ul class="nav pull-right">
              <li><%= link_to "Home",    '#' %></li>
              <li><%= link_to "Help",    '#' %></li>
              <li><%= link_to "Sign in", '#' %></li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
    <div class="container">
      <%= yield %>
    </div>
  </body>
</html>
{% endhighlight %}


有一点要注意，哈希在 Ruby 1.8 与 Ruby 1.9 中长的不太一样（参见[4.3.3 节](chapter4.html#sec-4-3-3)）。把下面的

{% highlight erb %}
<%= stylesheet_link_tag "application", :media => "all" %>
{% endhighlight %}

换成下面这样

{% highlight erb %}
<%= stylesheet_link_tag "application", media: "all" %>
{% endhighlight %}

因为旧的哈希写法流传很广，所以这两种写法你必须都能识别出来。

我们从上往下看一下代码 5.1 中新添加的元素。[3.1 节](chapter3.html#sec-3-1)简单的介绍过，Rails 3 默认会使用 HTML5（如 `<!DOCTYPE html>` 所示），因为 HTML5 标准还很新，有些浏览器（特别是较旧版本的 IE 浏览器）还没有完全支持，所以我们加载了一些 JavaScript 代码（称作“[HTML5 shim](http://code.google.com/p/html5shim/)”）来解决这个问题：
我们从头到尾看一下[代码 5.1](#list-5-1)中新添加的元素。在[3.1 节]里我曾经提过，Rails 3 默认会使用 HTML5（这一点从 `<!DOCYTYPE html>` 就能看出来）；因为相对来说，HTML5 标准还很新，有些浏览器（尤其是旧版本 IE）还不能完全支持，所以我们添加了一些 JavaScript 代码（[HTML5 shim](http://code.google.com/p/html5shim/)）来解决这个问题。

{% highlight html %}
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
{% endhighlight %}

比如下面这段比较奇怪的代码

{% highlight html %}
&lt;!--[if lt IE 9]&gt;
{% endhighlight %}

意思就是，当浏览器是版本号低于 9 的 IE 时（`if lt IE 9`），才会加载这段代码。这种奇怪的句法`[if lt IE 9]`并不是 Rails 提供的；其实这是 IE 为了解决上面的兼容问题而专门提供的[条件注释](http://en.wikipedia.org/wiki/Conditional_comment)。这样的好处是，既解决了低版本 IE 的兼容问题，又不会影响其他的 Firefox、Chrome、Safari等浏览器。

接下来是一个 `header` 区，其中包含了网站的纯文本LOGO、一些用 `div` 标签分隔的区块以及一个列表形式的导航链接：

{% highlight erb %}
<header class="navbar navbar-fixed-top">
    <div class="navbar-inner">
        <div class="container">
            <%= link_to "sample app", '#', id: "logo" %>
            <nav>
                <ul class="nav pull-right">
                    <li><%= link_to "Home",    '#' %></li>
                    <li><%= link_to "Help",    '#' %></li>
                    <li><%= link_to "Sign in", '#' %></li>
                </ul>
            </nav>
        </div>
    </div>
</header>
{% endhighlight %}

`header` 标签是用来表明这些内容应该放在页面的顶部。我们给 `header` 标签添加了两个 CSS class[^3]，分别叫做 `navbar` 和 `navbar-fixed-top`，两者之间用一个空格分开。

{% highlight html %}
<header class="navbar navbar-fixed-top">
{% endhighlight %}

所有的 HTML 元素都可以分配 class 和 id；它们可不仅仅只是标识，在 CSS 中是要派大用场的（[5.1.2 节](#sec-5-1-2)）。class 和 id 的主要区别在，在同一个页面中，class 可以用很多次，而 id 只能用一次。上面的 `navbar` 和 `navbar-fixed-top` 在 Bootstrap 框架（我们会在[5.1.2 节](#sec-5-1-2)安装使用）中都有特殊的意义。

可以看到 `header` 标签里，还有两个 `div` 标签：

{% highlight html %}
<div class="navbar-inner">
    <div class="container">
{% endhighlight %}

`div` 标签是常规区域，除了把文档分成不同的部分之外，没有特殊的意义。在以前的 HTML 中，几乎所有的区域都用 `div` 标签来划分，不过 HTML5 增加了 `header`、`nav` 和 `section` 元素，专门用来划分大多数网站中都会用到的区域。上面每个 `div` 也都指定了一个 CSS class。和 `header` 标签的 class 一样，这些 class 在 Bootstrap 中也有特殊的意义。

在这些 `div` 之后，有一些 ERb 代码：

{% highlight erb %}
<%= link_to "sample app", '#', id: "logo" %>
<nav>
  <ul class="nav pull-right">
    <li><%= link_to "Home",    '#' %></li>
    <li><%= link_to "Help",    '#' %></li>
    <li><%= link_to "Sign in", '#' %></li>
  </ul>
</nav>
{% endhighlight %}

这里用到了 Rails 的 `link_to` 帮助方法来创建链接（之前在 [3.3.2 节](chapter3.html#sec-3-3-2)中我们都是直接用 `a` 标签来实现的）；`link_to` 方法可以有三个参数，第一个参数是链接文本，第二个是链接地址。到[5.3.3 节]的时候我们会通过设置路由来为链接制定地址，现在先拿占位符 `#` 将就一下。第三个参数则是可选的，是一个哈希数组，上面我们用它来为这个链接添加了一个 CSS id `logo`。（另外三个链接没有第三个参数，因为这个参数并不是必须的。）可选的哈希参数在 Rails 的帮助方法中经常会用到，通过它我们可以为 HTML 标签灵活的添加各种属性。

`div` 中的第二个元素是一个列表形式的导航链接，使用了无需列表的标签 `ul`，以及列表项目标签 `li`：

{% highlight erb %}
<nav>
  <ul class="nav pull-right">
    <li><%= link_to "Home",    '#' %></li>
    <li><%= link_to "Help",    '#' %></li>
    <li><%= link_to "Sign in", '#' %></li>
  </ul>
</nav>
{% endhighlight %}

这里的 `nav` 标签其实并不是必须的，他的作用只在于区分出导航链接的区域。而 `ul` 标签的 `nav` 和 `pull-right` class 则依然是因为在 Bootstrap 中有特殊意义而存在的。上面的代码运行之后生成的 HTML 代码是下面这样的：

{% highlight erb %}
<nav>
  <ul class="nav pull-right">
    <li><a href="#">Home</a></li>
    <li><a href="#">Help</a></li>
    <li><a href="#">Sign in</a></li>
  </ul>
</nav>
{% endhighlight %}

布局文件中的最后一个 `div` 部分，是主内容区域：

{% highlight erb %}
<div class="container">
  <%= yield %>
</div>
{% endhighlight %}

同上，这个 `container` class 还是在Bootstrap 中有专门意思。`yield` 方法会把每个页面的内容插入到网站的布局当中，这个在[3.3.4 节](chapter3.html#sec-3-3-4)介绍过。

整个布局基本完成了（剩下的网站底部，我们会在[5.1.3 节](#sec-5-1-3)添加），访问 Home 页面就可以看到结果。为了用到上面添加的内容，我们还得往 `home.html.erb` 里面加些额外的东西。（[代码 5.2](#list-5-2)）

<p id="list-5-2">**代码 5.2**</p> “首页”的代码，包含一个到注册页面的链接 <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<div class="center hero-unit">
  <h1>Welcome to the Sample App</h1>

  <h2>
    This is the home page for the
    <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
    sample application.
  </h2>

  <%= link_to "Sign up now!", '#', class: "btn btn-large btn-primary" %>
</div>

<%= link_to image_tag("rails.png", alt: "Rails"), 'http://rubyonrails.org/' %>
{% endhighlight %}

上面代码中的第一个 `link_to` 方法，创建了一个链接，在[第七章](chapter7.html)我们会将它只想用户注册页面，这段代码生成的 HTML 是下面这样：

{% highlight erb %}
<a href="#" class="btn btn-large btn-primary">Sign up now!</a>
{% endhighlight %}

我都不愿意说了，`div` 标签里的 `hero-unit` class 在 Bootstrap 里有用，`btn`、 `btn-large`、`btn-primary`也是。

第二个 `link_to` 里用到了 `image_tag` 帮助方法，`image_tag` 的第一个参数是图片的路径，第二个则是可选的哈希数组，这里我们用了一个 symbol 作为键来设置图片的 `alt` 属性。为了看得更清楚一点，下面是生成的 HTML：[^4]

{% highlight html %}
<img alt="Rails" src="/assets/rails.png" />
{% endhighlight %}

如果图片无法加载，那么浏览器就会显示 `alt` 属性的内容，而为视障人士设计的屏幕阅读器中也会显示这个属性的内容。虽然 HTML 标准要求图片中必须包含 `alt` 属性，不过大家还是都懒得写。幸好 Rails 准备了一个默认的 `alt` 属性；如果在 `image_tag` 里没有指定的话，Rails 会直接使用这个图片的文件名。上面我们自己设定了 `alt` 属性为首字母大写的 “Rails”。

终于到检查成果的时候了（[图 5.2](#figure-5-2)）。其实不怎么样，对吧。不过好在我们已经给我们的 HTML 元素指定了合适的 class，下面我们可以很容易的添加 CSS 了。

你可能会奇怪，为什么 `rails.png` 这个不存在的图片居然显示出来了？这不科学啊！其实每个 Rails 程序里都包含了这个图片，存在路径是 `app/assets/images/rails.png`。因为我们使用了 `image_tag` 帮助方法，所以 Rails 会自动通过 asset pipeline 找到图片（[5.2 节](#section-5-2)）。

<p id="figure-5-2></p>"![layout_no_logo_or_custom_css_bootstrap](assets/images/figures/layout_no_logo_or_custom_css_bootstrap.png)

图 5.2：没有定义 CSS 的“首页”（[/static_pages/home](http://localhost:3000/static_pages/home)）

<h3 id="sec-5-1-2">5.1.2 Bootstrap 和自定义的 CSS</h3>

在 [5.1.2 节](#sec-5-1-2)我们为很多 HTML 元素指定了 CSS class，这样我们就可以使用 CSS 灵活的构建布局了。[5.1.1 节](#sec-5-1-1)中已经说过，很多 class 在 Bootstrap 中都有特殊的意义。Bootstrap 是 Twitter 开发的框架，可以方便的把精美的 Web 设计和用户界面元素添加到使用 HTML5 开发的应用程序中。本节，我们会结合 Bootstrap 和一些自定义的 CSS 为示例成成添加样式。

首先要安装 Bootstrap，在 Rails 程序中可以使用 bootstrap-sass 这个 gem，参见代码 5.3。Bootstrap 框架本身使用 LESS 来动态的生成样式表，而 Rails 的 asset pipeline 默认支持的是（非常类似的）Sass，bootstrap-sass 会将 LESS 转换成 Sass 格式，而且 Bootstrap 中必要的文件都可以在当前的应用程序中使用。<sup>[5](#fn-5)</sup>

**代码 5.3** 把 bootstrap-sass 加入 `Gemfile`

{% highlight ruby %}
source 'https://rubygems.org'

gem 'rails', '3.2.8'
gem 'bootstrap-sass', '2.0.4'
.
.
.
{% endhighlight %}

像往常一样，运行 `bundle install` 安装 Bootstrap：

{% highlight sh %}
$ bundle install
{% endhighlight %}

然后重启 Web 服务器，改动才能在应用程序中生效。（在大多数系统中可以使用 Ctrl-C 结束服务器，然后再执行 `rails server` 命令。）

要向应用程序中添加自定义的 CSS，首先要创建一个 CSS 文件：

{% highlight text %}
app/assets/stylesheets/custom.css.scss
{% endhighlight %}

（使用你喜欢的文本编辑器或者 IDE 创建这个文件。）文件存放的目录和文件名都很重要。其中目录

{% highlight text %}
app/assets/stylesheets
{% endhighlight %}

是 asset pipeline 的一部分（[5.2 节](#sec-5-2)），这个目录中的所有样式表都会自动的包含在网站的 `application.css` 中。`custom.css.scss` 文件的第一个扩展名是 `.css`，说明这是个 CSS 文件；第二个扩展名是 `.scss`，说明这是个“Sassy CSS”文件。asset pipeline 会使用 Sass 处理这个文件。（在 [5.2.2 节](#sec-5-2-2)中才会使用 Sass，bootstrap-sass 有了它才能运作。）创建了自定义 CSS 所需的文件后，我们可以使用 `@import` 引入 Bootstrap，如代码 5.4 所示。

**代码 5.4** 引入 Bootstrap <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";
{% endhighlight %}

这行代码会引入整个 Bootstrap CSS 框架，结果如图 5.3 所示。（或许你要通过 Ctrl-C 来重启服务器。）文本的位置还不是很合适，LOGO 也没有任何样式，不过颜色搭配和注册按钮看起来不错。

![sample_app_only_bootstrap](assets/images/figures/sample_app_only_bootstrap.png)

图 5.3：使用 Bootstrap CSS 后的示例程序

下面我们要加入一些整站都会用到的 CSS，用来样式化网站布局和各单独页面，如代码 5.5 所示。代码 5.5 中定义了很多样式规则。为了说明 CSS 规则的作用，我们经常会加入一些 CSS 注释，注释放在 `/*...*/` 中。代码 5.5 的 CSS 加载后的效果如图 5.4。

**代码 5.5** 添加全站使用的 CSS <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";

/* universal */

html {
  overflow-y: scroll;
}

body {
  padding-top: 60px;
}

section {
  overflow: auto;
}

textarea {
  resize: vertical;
}

.center {
  text-align: center;
}

.center h1 {
  margin-bottom: 10px;
}
{% endhighlight %}

![sample_app_universal](assets/images/figures/sample_app_universal.png)

图 5.4：添加一些空白和其他的全局性样式

注意代码 5.5 中的 CSS 格式是很统一的。一般来说，CSS 规则是通过 class、id、HTML 标签或者三者结合在一起来定义的，后面会跟着一些样式声明。例如：

{% highlight css %}
body {
  padding-top: 60px;
}
{% endhighlight %}

把页面的上内边距设为 60 像素。我们在 `header` 标签上指定了 `navbar-fixed-top` class，Bootstrap 就把这个导航条固定在页面的顶部。所以页面的上内边距会把主内容区和导航条隔开一段距离。下面的 CSS 规则：

{% highlight css %}
.center {
  text-align: center;
}
{% endhighlight %}

把 `.center` class 的样式定义为 `text-align: center;`。`.center` 中的点说明这个规则是样式化一个 class。（我们会在代码 5.7 中看到，`#` 是样式化一个 id。）这个规则的意思是任何 class 为 `.center` 的标签（例如 `div`），其中包含的内容都会在页面中居中显示。（代码 5.2 中有用到这个 class。）

虽然 Bootstrap 中包含了很精美的文字排版样式，我们还是要为网站添加一些自定义的规则，如代码 5.6 所示。（并不是所有的样式都会应用于“首页”，所有规则都会在网站中的某个地方用到。）代码 5.6 的效果如图 5.5 所示。

**代码 5.6** 添加一些精美的文字排版样式 <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";
.
.
.

/* typography */

h1, h2, h3, h4, h5, h6 {
  line-height: 1;
}

h1 {
  font-size: 3em;
  letter-spacing: -2px;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 1.7em;
  letter-spacing: -1px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: normal;
  color: #999;
}

p {
  font-size: 1.1em;
  line-height: 1.7em;
}
{% endhighlight %}

![sample_app_typography](assets/images/figures/sample_app_typography.png)

图 5.5：添加了一些文字排版样式

最后，我们还要为只包含文本“sample app”的网站 LOGO 添加一些样式。代码 5.7 中的 CSS 样式会把文字变成全大写字母，还修改了文字大小、颜色和位置。（我们使用的是 id，因为我们希望 LOGO 在页面中只出现一次，不过你也可以使用 class。）

**代码 5.7** 添加网站 LOGO 的样式 <br />`app/assets/stylesheets/custom.css.scss`

{% highlight css %}
@import "bootstrap";
.
.
.

/* header */

#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
}

#logo:hover {
  color: #fff;
  text-decoration: none;
}
{% endhighlight %}

其中 `color: #fff;` 会把 LOGO 文字的颜色变成白色。HTML 中的颜色代码是由 3 个 16 进制数组成的，分别代表了三原色中的红、绿、蓝。`#ffffff` 是 3 中颜色都为最大值的情况，代表了纯白色。`#fff` 是 `#ffffff` 的简写形式。CSS 标准中为很多常用的 HTML 颜色定义了别名，例如代表 `#fff` 的 `white`。代码 5.7 中的样式效果如图 5.6 所示。

![sample_app_logo](assets/images/figures/sample_app_logo.png)

图 5.6：样式化 LOGO 后的示例程序

<h3 id="sec-5-1-3">5.1.3 局部视图</h3>

虽然代码 5.1 中的布局达到了目的，但它的内容看起来有点混乱。HTML shim 就占用了三行，而且使用了只针对 IE 的奇怪句法，所以如果能把它打包放在一个单独的地方就好了。头部的 HTML 自成了一个逻辑单元，所以可以把这部分也打包放在某个地方。我们在 Rails 中可以使用局部视图来实现这种想法。先来看一下定义了局部视图之后的布局文件（参见代码 5.8）。

**代码 5.8** 定义了 HTML shim 和头部局部视图之后的网站布局 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", media: "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
    <%= render 'layouts/shim' %>
  </head>
  <body>
    <%= render 'layouts/header' %>
    <div class="container">
      <%= yield %>
    </div>
  </body>
</html>
{% endhighlight %}

代码 5.8 中，我们把加载 HTML shim 的那几行代码换成了对 Rails 帮助函数 `render` 的调用：

{% highlight erb %}
<%= render 'layouts/shim' %>
{% endhighlight %}

这行代码会寻找一个名为 `app/views/layouts/_shim.html.erb` 的文件，执行文件中的代码，然后把结果插入视图。<sup>[6](#fn-6)</sup>（回顾一下，执行 Ruby 表达式并将结果插入到模板中要使用 `<%=...%>`。）注意文件名 `_shim.html.erb` 的开头是个下划线，这个下划线是局部视图的命名约定，可以在目录中快速定位所有的局部视图。

当然，若要局部视图起作用，我们要写入相应的内容。本例中的 HTML shim 局部视图只包含三行代码，如代码 5.9 所示。

**代码 5.9** HTML shim 局部视图 <br />`app/views/layouts/_shim.html.erb`

{% highlight erb %}
<!--[if lt IE 9]>
<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
<![endif]-->
{% endhighlight %}

类似的，我们可以把头部的内容移入局部视图，如代码 5.10 所示，然后再次调用 `render` 把这个局部视图插入布局中。

**代码 5.10** 网站头部的局部视图 <br />`app/views/layouts/_header.html.erb`

{% highlight erb %}
<header class="navbar navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <%= link_to "sample app", '#', id: "logo" %>
      <nav>
        <ul class="nav pull-right">
          <li><%= link_to "Home",    '#' %></li>
          <li><%= link_to "Help",    '#' %></li>
          <li><%= link_to "Sign in", '#' %></li>
        </ul>
      </nav>
    </div>
  </div>
</header>
{% endhighlight %}

现在我们已经知道怎么创建局部视图了，让我们来加入和头部对应的网站底部吧。你或许已经猜到了，我们会将这个局部视图命名为 `_footer.html.erb`，放在布局目录中（参见代码 5.11）。<sup>[7](#fn-7)</sup>

**代码 5.11** 网站底部的局部视图 <br />`app/views/layouts/_footer.html.erb`

{% highlight erb %}
<footer class="footer">
  <small>
    <a href="http://railstutorial.org/">Rails Tutorial</a>
    by Michael Hartl
  </small>
  <nav>
    <ul>
      <li><%= link_to "About",   '#' %></li>
      <li><%= link_to "Contact", '#' %></li>
      <li><a href="http://news.railstutorial.org/">News</a></li>
    </ul>
  </nav>
</footer>
{% endhighlight %}

和头部类似，在底部我们使用 `link_to` 创建到“关于”页面和“联系”页面的链接，地址暂时使用占位符 `#`。（和 `header` 一样，`footer` 标签也是 HTML5 新增加的。）

按照 HTML shim 和头部局部视图采用的方式，我们也可以在布局视图中渲染底部局部视图。（参见代码 5.12。）

**代码 5.12** 网站的布局，包含底部局部视图 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", media: "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
    <%= render 'layouts/shim' %>
  </head>
  <body>
    <%= render 'layouts/header' %>
    <div class="container">
      <%= yield %>
      <%= render 'layouts/footer' %>
    </div>
  </body>
</html>
{% endhighlight %}

当然，如果没有样式的话，底部还是很丑的（样式参见代码 5.13）。效果如图 5.7。

**代码 5.13** 添加底部所需的 CSS <br />`app/assets/stylesheets/custom.css.scss`

{% highlight scss %}
.
.
.

/* footer */

footer {
  margin-top: 45px;
  padding-top: 5px;
  border-top: 1px solid #eaeaea;
  color: #999;
}

footer a {
  color: #555;
}

footer a:hover {
  color: #222;
}

footer small {
  float: left;
}

footer ul {
  float: right;
  list-style: none;
}

footer ul li {
  float: left;
  margin-left: 10px;
}
{% endhighlight %}

![site_with_footer_bootstrap](assets/images/figures/site_with_footer_bootstrap.png)

图 5.7：添加底部后的“首页”（[/static_pages/home](http://localhost:3000/static_pages/home)）

<h2 id="sec-5-2">5.2 Sass 和 asset pipeline</h2>

Rails 3.0 与较新版之间的主要不同之一是 asset pipeline，这个功能可以明显提高如 CSS、JavaScript和图片等静态资源文件的生成和管理效率。本节我们会概览一下 asset pipeline，然后再介绍如何使用 Sass 这个生成 CSS 很强大的工具，Sass 现在是 asset pipeline 默认的一部分。

<h3 id="sec-5-1-1">5.1.1 Asset pipeline</h3>

Asset pipeline 对 Rails做了很多改动，但对 Rails 开发者来说只有三个特性需要了解：资源目录，清单文件（manifest file），还有预处理器引擎（preprocessor engine）。<sup>[8](#fn-8)</sup> 让我们一个一个的学习。

#### 资源目录

在 Rails 3.0 之前（包括 3.0），静态文件分别放在如下的 `public/` 目录中：

- `public/stylesheets`
- `public/javascripts`
- `public/images`

这些文件夹中的文件通过请求 http://example.com/stylesheets 等地址直接发送给浏览器。（Rails 3.0 之后的版本也会这么做。）

从 Rails 3.1 开始，静态文件可以存放在三个标准的目录中，各有各的用途：

- `app/assets`：存放当前应用程序用到的资源文件
- `lib/assets`：存放开发团队自己开发的代码库用到的资源文件
- `vendor/assets`：存放第三方代码库用到的资源文件

你可能猜到了，上面的目录中都会有针对不同资源类型的子目录。例如：

{% highlight sh %}
$ ls app/assets/
images      javascripts stylesheets
{% endhighlight %}

现在我们就可以知道 [5.1.2 节](#sec-5-1-2)中 `custom.css.scss` 存放位置的用意：因为 `custom.css.scss` 是应用程序本身用到的，所以把它存放在 `app/assets/stylesheets` 中。

#### 清单文件

当你把资源文件存放在适当的目录后，要通过清单文件告诉 Rails（使用 [Sprockets](https://github.com/sstephenson/sprockets) gem）怎么把它们合并成一个文件。（只适用于 CSS 和 JavaScript，而不会处理图片。）举个例子说明一下，让我们看一下应用程序默认的样式表清单文件（参见代码 5.14）。

**代码 5.14** 应用程序用到的 CSS 文件的清单文件 <br />`app/assets/stylesheets/application.css`

{% highlight css %}
/*
 * This is a manifest file that'll automatically include all the stylesheets
 * available in this directory and any sub-directories. You're free to add
 * application-wide styles to this file and they'll appear at the top of the
 * compiled file, but it's generally better to create a new file per style
 * scope.
 *= require_self
 *= require_tree .
*/
{% endhighlight %}

这里的关键代码是几行 CSS 注释，Sprockets 通过这些注释加载相应的文件：

{% highlight css %}
/*
 * .
 * .
 * .
 *= require_self
 *= require_tree .
*/
{% endhighlight %}

上面代码中的

{% highlight text %}
*= require_tree .
{% endhighlight %}

会把 `app/assets/stylesheets` 目录中的所有 CSS 文件都引入应用程序的 CSS 文件中。

下面这行：

{% highlight text %}
*= require_self
{% endhighlight %}

会把 `application.css` 这个文件中的 CSS 也加载进来。

Rails 提供了一个合用的默认清单文件，所以本书不会对其做任何修改。Rails 指南中有一篇专门[介绍 asset pipeline 的文章](http://guides.rubyonrails.org/asset_pipeline.html)，该文有你需要知道的更为详细的内容。

#### 预处理器引擎

准备好资源文件后，Rails 会使用一些预处理器引擎来处理它们，通过清单文件将其合并，然后发送给浏览器。我们通过扩展名告诉 Rails 要使用哪个预处理器。三个最常用的扩展名是：Sass 文件的 `.scss`，CoffeeScript 文件的 `.coffee`，ERb 文件的 `.erb`。我们在 [3.3.3 节](chapter3.html#sec-3-3-3)介绍过 ERb，[5.2.2 节](#sec-5-2-2)会介绍 Sass。本教程不需要使用 CoffeeScript，这是一个很小巧的语言，可以编译成 JavaScript。（RailsCast 中[关于 CoffeeScript 的视频](http://railscasts.com/episodes/267-coffeescript-basics)是个很好的入门教程。）

预处理器引擎可以连接在一起使用，因此

{% highlight text %}
foobar.js.coffee
{% endhighlight %}

只会使用 CoffeeScript 处理器，而

{% highlight text %}
foobar.js.erb.coffee
{% endhighlight %}

会使用 CoffeeScript 和 ERb 处理器（按照扩展名的顺序从右向左处理，所以 CoffeeScript 处理器会先执行）。

#### 在生产环境中的效率问题

Asset pipeline 带来的好处之一是，它会自动优化资源文件，在生产环境中使用效果极佳。CSS 和 JavaScript 的传统组织方式是将不同功能的代码放在不同的文件中，而且代码的格式是对人类友好的（有很多缩进）。虽然这对编程人员很友好，但在生产环境中使用却效率底下。加载大量的文件会明显增加页面加载时间（这是影响用户体验最主要的因素之一）。使用 asset pipeline，生产环境中应用程序所有的样式都会集中到一个 CSS 文件中（`application.css`），所有 JavaScript 代码都会集中到一个 JavaScript 文件中（`javascript.js`），而且还会压缩这些文件（包括 `lib/assets` 和 `vendor/assets` 中的相关文件），把不必要的空格删除，减小文件大小。这样我们就最好的平衡了两方面的需求：编程人员使用格式友好的多个文件，生产环境中使用优化后的单个文件。

<h3 id="sec-5-2-2">5.2.2 句法强大的样式表</h3>

Sass 是一种编写样式表的语言，它从多方面增强了 CSS 的功能。本节我们会介绍其中两个最主要的，嵌套和变量。（还有一个是 mixin，会在 [7.1.1 节](chapter7.html#7-1-1)中介绍。）

如 [5.1.2 节](#sec-5-1-2)中的简单介绍，Sass 支持一种名为 SCSS 的格式（扩展名为 `.scss`），这是 CSS 句法的一个扩展集。SCSS 只是为 CSS 添加了一些功能，而没有定义全新的句法。<sup>[9](#fn-9)</sup> 也就是说，所有合法的 CSS 文件都是合法的 SCSS 文件，这对已经定义了样式的项目来说是件好事。在我们的程序中，从一开始就使用了 SCSS，因为我们要使用 Bootstrap。Rails 的 asset pipeline 会自动使用 Sass 处理器处理扩展名为 `.scss` 的文件，所以 `custom.css.scss` 文件会首先经由 Sass 预处理器处理，然后引入程序的样式表中，再发送给浏览器。

#### 嵌套

样式表中经常会定义嵌套元素的样式，例如，在代码 5.1 中，定义了 `.center` 和 `.centr h1` 两个样式：

{% highlight css %}
.center {
  text-align: center;
}

.center h1 {
  margin-bottom: 10px;
}
{% endhighlight %}

使用 Sass 可将其改写成

{% highlight scss %}
.center {
  text-align: center;
  h1 {
    margin-bottom: 10px;
  }
}
{% endhighlight %}

上面代码中的 `h1` 会自动潜入 `.center` 中。

嵌套还有另一种形式，句法稍有不同。在代码 5.7 中，有如下的代码

{% highlight css %}
#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
}

#logo:hover {
  color: #fff;
  text-decoration: none;
}
{% endhighlight %}

其中 LOGO 的 id `#logo` 出现了两次，一次是单独出现的，另一次是和 `hover` 伪类一起出现的（鼠标悬停其上时的样式）。如要嵌套第二个样式，我们需要在引用父级元素 `#logo`，在 SCSS 中，使用 `&` 符号实现：

{% highlight scss %}
#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
  &:hover {
    color: #fff;
    text-decoration: none;
  }
}
{% endhighlight %}

把 SCSS 转换成 CSS 时，Sass 会把 `&:hover` 编译成 `#logo:hover`。

这两种嵌套方式都可以用于代码 5.13 中的底部样式上，转换后的样式如下：

{% highlight scss %}
footer {
  margin-top: 45px;
  padding-top: 5px;
  border-top: 1px solid #eaeaea;
  color: #999;
  a {
    color: #555;
    &:hover {
      color: #222;
    }
  }
  small {
    float: left;
  }
  ul {
    float: right;
    list-style: none;
    li {
      float: left;
      margin-left: 10px;
    }
  }
}
{% endhighlight %}

自己动手转换一下代码 5.13 是个不错的练习，转换之后你应该验证一下 CSS 是否还能正常使用。

#### 变量

Sass 允许我们自定义变量来避免重复，这样也可以写出更具表现力的代码。例如，代码 5.6 和代码 5.13 中都重复使用了同一个颜色代码：

{% highlight scss %}
h2 {
  .
  .
  .
  color: #999;
}
.
.
.
footer {
  .
  .
  .
  color: #999;
}
{% endhighlight %}

上面代码中的 `#999` 是淡灰色（ligh gray），我们可以为它定义一个变量：

{% highlight scss %}
$lightGray: #999;
{% endhighlight %}

然后我们就可以这样写 SCSS：

{% highlight scss %}
$lightGray: #999;
.
.
.
h2 {
  .
  .
  .
  color: $lightGray;
}
.
.
.
footer {
  .
  .
  .
  color: $lightGray;
}
{% endhighlight %}

因为像 `$lightGray` 这样的变量名比 `#999` 更具说明性，所以为没有重复使用的值定义变量往往也是很有用的。Bootstrap 框架定义了很多颜色变量，[Bootstrap 页面中有这些变量的 LESS 形式](http://bootstrapdocs.com/v2.0.4/docs/less.html)。这个页面中的变量使用的是 LESS 句法，而不是 Sass 句法，不过 bootstrap-sass gem 为我们提供了对应的 Sass 形式。二者之间的对应关系不难猜出，LESS 使用 `@` 符号定义变量，而 Sass 使用 `$` 符号。在 Bootstrap 的变量页面我们可以看到为淡灰色定义的变量：

{% highlight less %}
@grayLight: #999;
{% endhighlight %}

也就是说，在 bootstrap-sass gem 中会有一个对应的 SCSS 变量 `$grayLight`。我们可以用它换掉自己定义的 `$lightGray` 变量：

{% highlight scss %}
h2 {
  .
  .
  .
  color: $grayLight;
}
.
.
.
footer {
  .
  .
  .
  color: $grayLight;
}
{% endhighlight %}

使用 Sass 提供的嵌套和定义变量功能后得到的完整 SCSS 文件如代码 5.15 所示。这段代码中使用了 Sass 形式的颜色变量（参照 Bootstrap 变量页面中定义的 LESS 形式的颜色变量）和内置的颜色名称（例如，`white` 代表 `#fff`）。特别注意一下对 `footer` 标签样式明显的改进。

**代码 5.15** 使用嵌套和变量转后后的 SCSS 文件 <br />`app/assets/stylesheets/custom.css.scss`

{% highlight scss %}
@import "bootstrap";

/* mixins, variables, etc. */

$grayMediumLight: #eaeaea;

/* universal */

html {
  overflow-y: scroll;
}

body {
  padding-top: 60px;
}

section {
  overflow: auto;
}

textarea {
  resize: vertical;
}

.center {
  text-align: center;
  h1 {
    margin-bottom: 10px;
  }
}

/* typography */

h1, h2, h3, h4, h5, h6 {
  line-height: 1;
}

h1 {
  font-size: 3em;
  letter-spacing: -2px;
  margin-bottom: 30px;
  text-align: center;
}

h2 {
  font-size: 1.7em;
  letter-spacing: -1px;
  margin-bottom: 30px;
  text-align: center;
  font-weight: normal;
  color: $grayLight;
}

p {
  font-size: 1.1em;
  line-height: 1.7em;
}


/* header */

#logo {
  float: left;
  margin-right: 10px;
  font-size: 1.7em;
  color: white;
  text-transform: uppercase;
  letter-spacing: -1px;
  padding-top: 9px;
  font-weight: bold;
  line-height: 1;
  &:hover {
    color: white;
    text-decoration: none;
  }
}

/* footer */

footer {
  margin-top: 45px;
  padding-top: 5px;
  border-top: 1px solid $grayMediumLight;
  color: $grayLight;
  a {
    color: $gray;
    &:hover {
      color: $grayDarker;
    }
  }
  small {
    float: left;
  }
  ul {
    float: right;
    list-style: none;
    li {
      float: left;
      margin-left: 10px;
    }
  }
}
{% endhighlight %}

Sass 为我们提供了很多功能可以用来简化样式表，不过代码 5.15 只用到了最主要的功能，这是一个很好的开始。更多功能请查看 [Sass 网站](http://sass-lang.com/)。


------------------------------------
[^1]:
[^2]:
