---
layout: chapter
title: 第三章 Rails 背后的 Ruby
---

有了[第三章](chapter3.html)中的例子做铺垫，本章将为你介绍一些对 Rails 来说很重要的 Ruby 知识。Ruby 语言的知识点很多，不过对于一个 Rails 开发者而言需要掌握的很少。我们采用的是有别于常规的 Ruby 学习过程，我们的目标是开发动态的 Web 应用程序，所以我建议你先学习 Rails，在这个过程中学习一些 Ruby 知识。如果要成为一个 Rails 专家，你就要更深入的掌握 Ruby 了。本书会为在你成为专家的路途上奠定一个坚实的基础。如 [1.1.1 节](chapter1.html#sec-1-1-1)中说过的，读完本书后我建议你阅读一本专门针对 Ruby 的书，例如《[Ruby 入门](http://www.amazon.com/gp/product/1430223634)》、《[The Well-Frounded Rubyist](http://www.amazon.com/gp/product/1933988657)》或《[Ruby 之道](http://www.amazon.com/gp/product/0672328844)》。

本将介绍了很多内容，第一遍阅读没有掌握全部是可以理解的。在后续的章节我会经常地提到本章的内容。

<h2 id="sec-4-1">4.1 导言</h2>

从上一章我们可以看到，即使不懂任何背后用到的 Ruby 语言，我们也可以创建一个 Rails 应用程序骨架，也可以进行测试。我们依赖的是本教程中提供测试代码，得到错误信息，然后让其通过。我们不能总是这样做，所以我们要暂别网站开发学习这一章，正视我们的 Ruby 短肋。

最后一次接触应用程序时，我们已经让几乎是静态的页面使用 Rails 布局来去除重复了。（参见代码 4.1）

**代码 4.1** 示例程序的网站布局 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
    <%= stylesheet_link_tag    "application", :media => "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
  </head>
  <body>
    <%= yield %>
  </body>
</html>
{% endhighlight %}

让我们把注意力集中在代码 4.1 中的这一行：

{% highlight erb %}
<%= stylesheet_link_tag "application", :media => "all" %>
{% endhighlight %}

这行代码使用 Rails 内置的方法 `stylesheet_link_tag`（更多内容请查看 [Rails API 文档](http://api.rubyonrails.org/v3.2.0/classes/ActionView/Helpers/AssetTagHelper/StylesheetTagHelpers.html#method-i-stylesheet_link_tag)）为所有的[媒体类型](http://www.w3.org/TR/CSS2/media.html)引入了 `application.css`。对于经验丰富的 Rails 开发者来说，这一行很简单，但是这里却至少包含了困惑着你的四个 Ruby 知识点：内置的 Rails 方法，不用括号的方法调用，Symbol，Hash。这几点本章都会介绍。

除了提供很多内置的方法供我们在视图中使用之外，Rails 还允许我们自行创建。自行创建的这些方法叫做帮助方法（helper）。要说明如何自行创建一个帮助方法，我们要来看看代码 4.1 中标题那一行：

{% highlight erb %}
Ruby on Rails Tutorial Sample App | <%= yield(:title) %>
{% endhighlight %}

这行代码依赖于每个视图中定义的页面标题（使用 `provide`），例如

{% highlight erb %}
<% provide(:title, 'Home') %>
<h1>Sample App</h1>
<p>
  This is the home page for the
  <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
  sample application.
</p>
{% endhighlight %}

那么如果我们不提供标题会怎样呢？我们的标题一般都包含一个公共部分，如果想更具体些就要加上一个变动的部分了。我们在布局中用了个小技巧基本上已经实现了这样的标题，如果我们删除了一个视图中的 `provide` 方法调用，输出的标题就没有了变动的那部分：

{% highlight text %}
Ruby on Rails Tutorial Sample App |
{% endhighlight %}

公共部分已经输出了，而且后面还有一个竖杠 `|`。

为了解决这个标题问题，我们会自定义一个帮助方法，叫做 `full_title`。如果视图中没有定义标题，`full_title` 会返回标题的公共部分，即“Ruby on Rails Tutorial Sample App”；如果定义了，则会在公共部分后面加上一个竖杠，然后再接上该页面的标题（如代码 4.2）。<sup>[1](#fn-1)</sup>

**代码 4.2** 定义 `full_title` 帮助方法 <br />`app/helpers/application_helper.rb`

{% highlight ruby %}
module ApplicationHelper

  # Returns the full title on a per-page basis.
  def full_title(page_title)
    base_title = "Ruby on Rails Tutorial Sample App"
    if page_title.empty?
      base_title
    else
      "#{base_title} | #{page_title}"
    end
  end
end
{% endhighlight %}

现在我们已经定义了一个帮助方法，我们可以用它来简化布局，将

{% highlight ruby %}
<title>Ruby on Rails Tutorial Sample App | <%= yield(:title) %></title>
{% endhighlight %}

替换成

{% highlight ruby %}
<title><%= full_title(yield(:title)) %></title>
{% endhighlight %}

如代码 4.3 所示。

**代码 4.3** 示例程序的网站布局 <br />`app/views/layouts/application.html.erb`

{% highlight erb %}
<!DOCTYPE html>
<html>
  <head>
    <title><%= full_title(yield(:title)) %></title>
    <%= stylesheet_link_tag    "application", :media => "all" %>
    <%= javascript_include_tag "application" %>
    <%= csrf_meta_tags %>
  </head>
  <body>
    <%= yield %>
  </body>
</html>
{% endhighlight %}

为了让这个帮助方法起作用，我们要在“首页”视图中将不必要的“Home”这个词删掉，让标题只保留公共部分。首先我们要按照代码 4.4 的内容更新现有的测试，增加测试没包含 `'Home'` 的标题。

**代码 4.4** 更新“首页”标题的测试 <br />`spec/requests/static_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Static pages" do

  describe "Home page" do

    it "should have the h1 'Sample App'" do
      visit '/static_pages/home'
      page.should have_selector('h1', :text => 'Sample App')
    end

    it "should have the base title" do
      visit '/static_pages/home'
      page.should have_selector('title',
                        :text => "Ruby on Rails Tutorial Sample App")
    end

    it "should not have a custom page title" do
      visit '/static_pages/home'
      page.should_not have_selector('title', :text => '| Home')
    end
  end
  .
  .
  .
end
{% endhighlight %}

试试看你能否猜到为什么我们添加了一个新测试而不是直接在修改之前的测试。（提示：答案在 [3.3.1 节](chapter3.html#sec-3-3-1)中。）

运行测试，查看是否有一个测试失败了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

为了让测试通过，我们要将“首页”视图中的 `provide` 那行删除，如代码 4.5 所示。

**代码 4.5** 删除标题定义后的“首页” <br />`app/views/static_pages/home.html.erb`

{% highlight erb %}
<h1>Sample App</h1>
<p>
  This is the home page for the
  <a href="http://railstutorial.org/">Ruby on Rails Tutorial</a>
  sample application.
</p>
{% endhighlight %}

现在测试应该可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/static_pages_spec.rb
{% endhighlight %}

和引入应用程序样式表那行代码一样，代码 4.2 的内容对经验丰富的 Rails 开发者来说看起来很简单，但是充满了很多会让人困惑的 Ruby 知识：module，注释，局部变量的赋值，布尔值，流程控制，字符串插值，还有返回值。这章也会介绍这些知识。

<h2 id="sec-4-2">4.2 字符串和方法</h2>

学习 Ruby 我们主要使用的工具是 Rails 控制台，它是用来和 Rails 应用程序交互的命令行，在 [2.3.3 节](chapter2.html#sec-2-3-3)中介绍过。这个控制台是基于 Ruby 的交互程序（`irb`）制造的，因此也就能使用 Ruby 语言的全部功能。（在 [4.4.4 节](#sec-4-4-4)中会介绍，控制台还可以进入 Rails 环境。）使用下面的方法在命令行中启动控制台：

{% highlight sh %}
$ rails console
Loading development environment
>>
{% endhighlight %}

默认情况下，控制台是以开发环境启用的，这是 Rails 定义的三个独立的环境之一（其他两个是测试环境和生产环境）。三个环境的区别在本章还不需要知道，我们会在 [7.1.1 节](#sec-7-1-1)中更详细的介绍。

控制台是个很好的学习工具，你不用有所畏惧尽情的使用吧，没必要担心，你（几乎）不会破坏任何东西。如果你在控制器中遇到问题了可以使用 Ctrl-C 结束当前执行的命令，或者使用 Ctrl-D 直接结束控制器。在阅读本章后面的内容时，你会发现查阅 [Ruby API](http://ruby-doc.org/core-1.9.3/) 很有用。API 包含很多信息，例如，如果你想查看关于 Ruby 字符串更多的内容，可以查看其中的 `String` 类页面。

<h3 id="sec-4-2-1">4.2.1 注释</h3>

Ruby 中的注释以井号 `#`（也叫“Hask Mark”，或者更诗意的叫“散列字元”）开头，一直到行尾结束。Ruby 会忽略注释，但是注释对代码阅读者（包括代码的创作者）却很有用。在下面的代码中

{% highlight ruby %}
  # Returns the full title on a per-page basis.
  def full_title(page_title)
    .
    .
    .
  end
{% endhighlight %}

第一行就是注释，它说明了后面的方法的目的。

你一般无需在控制台中写注释，不过为了说明代码，我会按照下面的形式加上注释，例如：

{% highlight sh %}
$ rails console
>> 17 + 42   # Integer addition
=> 59
{% endhighlight %}

在本节的阅读过程中，如果要在控制台中输入或者复制粘贴命令，如果愿意你可以忽略注释，反正控制台会忽略注释。

<h3 id="sec-4-2-2">4.2.2 字符串</h3>

字符串算是 Web 应用程序中最有用的数据结构了，因为网页就是含有从数据库发送到浏览器的字符串。然我们现在控制台中体验一下字符串，这次我们使用 `rails c` 启动控制台，这是 `rails console` 的快捷方式：

{% highlight sh %}
$ rails c
>> ""         # 空字符串
=> ""
>> "foo"      # 非空的字符串
=> "foo"
{% endhighlight %}

上面的字符串是字面量（字面量字符串，literal string），通过双引号（`"`）创建。控制器回显的是每一行的计算结果，本例中字符串字面量的结果就是字符串本身。

我们还可以使用 `+` 号连接字符串：

{% highlight sh %}
>> "foo" + "bar"    # 字符串连接
=> "foobar"
{% endhighlight %}

另外一种创建字符串的方式是通过一个特殊的句法（`#{}`）进行插值操作：<sup>[3](#fn-3)</sup>

{% highlight sh %}
>> first_name = "Michael"    # 变量赋值
=> "Michael"
>> "#{first_name} Hartl"     # 字符串插值
=> "Michael Hartl"
{% endhighlight %}

我们先把“`Michael`”赋值给变量 `first_name`，然后将其插入到字符串 `"#{first_name} Hartl"` 中。我们可以将两个字符串都赋值给变量：

{% highlight sh %}
>> first_name = "Michael"
=> "Michael"
>> last_name = "Hartl"
=> "Hartl"
>> first_name + " " + last_name    # 字符串连接，中间加了空格
=> "Michael Hartl"
>> "#{first_name} #{last_name}"    # 作用相同的插值
=> "Michael Hartl"
{% endhighlight %}

注意，两个表达式的结果是相同的，不过我倾向与使用插值的方式。在两个字符串中加入一个空格（`" "`）显得很别扭。


<h4>打印字符串</h4>

打印字符串最常用的 Ruby 方法是 `puts`（读作“put ess”，意思是“打印字符串”）：

{% highlight sh %}
>> puts "foo"     # 打印字符串
foo
=> nil
{% endhighlight %}

`puts` 方法还有一个副作用（side-effect）：`puts "foo"` 首先会将字符串打印到屏幕上，然后再返回[字面量的空值](http://www.answers.com/nil)，`nil` 是 Ruby 中的“什么都没有”。（后续内容中为了行文简洁我会省略 `=> nil`。）

`puts` 方法会自动在输出的字符串后面加入换行符 `\n`，功能类似的 `print` 方法则不会：

{% highlight sh %}
>> print "foo"    # 打印字符串（和 puts 类似，但没有添加字符串）
foo=> nil
>> print "foo\n"  # 和 puts "foo"
foo 一样
=> nil
{% endhighlight %}

<h4>单引号字符串</h4>

目前介绍的例子都是使用双引号创建的字符串，不过 Ruby 也支持用单引号创建字符串。大多数情况下这两种字符串的效果是一样的：

{% highlight sh %}
>> 'foo'          # 单引号创建的字符串
=> "foo"
>> 'foo' + 'bar'
=> "foobar"
{% endhighlight %}

不过两种方法还是有个很重要的区别的：Ruby 不会对单引号字符串进行插值操作：

{% highlight sh %}
>> '#{foo} bar'     # 单引号字符串不能进行插值操作
=> "\#{foo} bar"
{% endhighlight %}

注意控制台是如何使用双引号返回结果的，需要使用反斜线转义特殊字符，例如 `#`。

如果双引号字符串可以做单引号所做的所有事，而且还能进行插值，那么单引号字符串存在的意义是什么呢？单引号字符串的用处在于它们真的就是字面值，只包含你输入的字符。例如，反斜线在很多系统中都很特殊，就像换行符（`\n`）一样。如果有一个变量需要包含一个反斜线，使用单引号就很简单：

{% highlight sh %}
>> '\n'       # 反斜线和 n 字面值
=> "\\n"
{% endhighlight %}

和前例的 `#` 字符一样，Ruby 要使用一个额外的反斜线来转义反斜线，在双引号字符串中，要表达一个反斜线就要使用两个反斜线。对简单的例子来说，这省不了多少事，不过如果有很多需要转义的字符就显得出它的作用了：

{% highlight sh %}
>> 'Newlines (\n) and tabs (\t) both use the backslash character \.'
=> "Newlines (\\n) and tabs (\\t) both use the backslash character \\."
{% endhighlight %}

<h3 id="sec-4-2-3">4.2.3 对象及向其传递消息</h3>
