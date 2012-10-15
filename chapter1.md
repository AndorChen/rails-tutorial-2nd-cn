---
layout: chapter
title: 第一章 从零到部署
---

欢迎学习《Ruby on Rails 教程》。本书的目标是成为“如果想学习使用 Ruby on Rails 进行 Web 开发，我应该从那儿开始？”这一问题的最好答案。学习完本书的内容之后，你将具备使用 Rails 进行开发和部署 Web 程序的技能。同时你还能够从一些进阶的书籍、博客和视频教程等活跃的 Rails 教学体系中继续深造。本书基于 Rails 3，这里的知识代表着 Web 开发的发展方向。（《Ruby on Rails 教程》的最新版本可以从[本书的网站](http://railstutorial.org/)上获取。）

注意，本书的目标并不仅仅是教你 Rails，而是教你怎样使用 Rails 进行 Web 开发，教会你为因特网开发软件的技能。除了讲到 Ruby on Rails 之外，涉及到的技术还有 HTML、CSS、数据库、版本控制、测试和部署。为了达成学习目标，本书使用了一种完整的方案：通过实例学习使用 Rails 从零开始创建一个真正的程序。如 [Derek Sivers] 在前言中所说的，本书内容采用线形结构，需要从头开始按顺序读到结尾。如果你经常跳着阅读技术类书籍，这种线形的组织方式需要你适应一下。你可以将本书设想为一个电子游戏，学习玩每一章就会升一级。（而练习就是每一关的[小怪兽](http://en.wikipedia.org/wiki/Boss_\(video_gaming\)#Miniboss)。）

本章将首先介绍如何安装 Ruby on Rails 所需的软件，搭建开发所需的环境（[1.2 节](#sec-1-2 "跳到 1.2 节")）。然后创建第一个 Rails 程序 `first_app`。本书会遵从一些优秀的软件开发习惯，所以在创建第一个程序后我们会立即将它放到版本控制系统 Git 中（[1.3 节](#sec-1-3 "跳到 1.3 节")）。最后，我们还将把这个程序放到实际的生产环境中运行（[1.4 节](#sec-1-4 "跳到 1.4 节")）。

第二章我们会创建第二个程序，演示一些 Rails 程序的基本操作。为了快速创建，我们会使用脚手架功能（[旁注 1.1](#box-1-1 "跳到旁注 1.1")）来创建一个示例程序（名为 `demo_app`），因为生成的代码还很粗糙也很复杂，第二章将集中精力在通过浏览器的 URI （有时也称 URL）<sup>[1](#fn-1)</sup>来和程序交互这一点上。

本书剩下的章节将介绍从零开始开发一个大型示例程序（名为 `sample_app`）。在这个程序的开发过程中将使用“测试驱动开发”（TDD=Test-driven Development）理念，从第三章开始创建静态页面，然后增加一些动态的内容。第四章则会简要的介绍一下 Rails 背后的 Ruby 程序语言。第五章到第九章将逐步完善这个程序的基础框架：网站的布局，用户数据模型，完整的注册和验证系统。最后在第十章和第十一章将添加微博和社交网站的功能，最终开发出一个可以实际运行的示例网站。

最终的示例程序将在外表上和一个同样采用 Rails 开发的微博网站十分相似（*译者注：指 Twiiter*）。虽然我们将主要的精力集中在这个示例程序上了，但是本书的重点却在于提供一些通用的方法，这样你就会具有坚实的基本功，不论开发什么样的 Web 程序都能够派上用场。

<div id="box-1-1" class="aside">
	<h4 class="title">旁注 1.1 脚手架：更快，更简单，更诱人</h4>
	<p>Rails 出现伊始就吸引了众多目光，特别是 Rails 创始人 DHH （David Heinemeier Hansson）制作的著名的“<a href="http://media.rubyonrails.org/video/rails_take2_with_sound.mov">15分钟博客程序</a>”视频，该视频以及其衍生版本是窥探 Rails 强大功能一种很好的方式，我推荐你也看一下这些视频。剧透一下：这些视频中的演示能控制在15分钟得益于一个叫做“脚手架（scaffold）”的功能，它通过 Rails 命令 `generate` 生产大量的代码。</p>
	<p>很多人制作 Rails 教程时选择使用脚手架功能，因为它<a href="http://en.wikipedia.org/wiki/Dark_side_(Star_Wars)">更快、更简单、更诱人</a>。不过脚手架会生成大量复杂的代码，这些会使初学者产生困惑，虽然会使用但却不明白到底发生了什么事。使用脚手架功能可能会把你变成一个脚本生成器的使用者但却不会增进你对 Rails 知识的掌握。</p>
	<p>本书将采用一种不同的方式，虽然第二章会用脚手架开发一个小型的示例程序，但本书的核心是从第三章开始开发的较为大型的程序。在开发个大型程序的每一个阶段我们只会编写少量的代码，易于理解但又具有一定的挑战性。这样的过程最终会让你对 Rails 知识有较为深刻地理解，能灵活运用，创建几乎任何类型的 Web 程序。</p>
</div>

<h2 id="sec-1-1">1.1 简介</h2>

自 2004 年出现，Rails 迅速成为动态 Web 程序开发领域功能最强大、最受欢迎的框架之一。从初创的项目到很多的大公司都在使用 Rails：[37signals](http://37signals.com/)，[Github](http://github.com/)，[Shopify](http://shopify.com/)，[Scribd](http://scribd.com/)，[Twitter](http://twitter.com/)，[LivingSocial](http://livingsocial.com/)，[Groupon](http://groupon.com/)，[Hulu](http://hulu.com/) 和 [Yellow Pages](http://yellowpages.com/) 等，[这个列表](http://rubyonrails.org/applications)还很长。有很多 Web 开发工作室也在使用 Rails，比如 [ENTP](http://entp.com/)，[thoughtbot](http://thoughtbot.com/)，[Pivotal Labs](http://pivotallabs.com/) 和 [Hashrocket](http://hashrocket.com/)，以及无数的独立顾问，培训人员和承包商。

是什么使得 Rails 如此成功呢？首先，Ruby on Rails 是完全开源的，基于 [MIT 协议](http://www.opensource.org/licenses/mit-license.php)发布，可以免费下载、使用。Rails 的成功有很大一部分是得益于它优雅而紧凑的设计。研习 Ruby 语言的高可扩展性后，Rails 开发了一套用于开发 Web 程序的 [DSL](http://en.wikipedia.org/wiki/Domain_Specific_Language)（Domain-speific Language）。所以 Web 编程中像生成 HTML、创建数据模型、URI 路由等任务在 Rails 中都很容易实现，最终得到的程序代码很简洁而且可读性较高。

Rails 还会快速跟进 Web 领域最新的技术和框架架构技术。例如，Rails 是最早实现 REST 这个 Web 程序架构体系的框架之一（这一体系将贯穿本书）。当其他的框架开发出成功的新技术后，Rails 的创建者 DHH 及起核心开发团队会毫不犹豫的将其吸纳进来。或许最典型的例子就是 Rails 和 Merb （和 Rails 类似的 Ruby Web 框架）两个项目的合并，这样一来 Rails 就继承了 Merb 的模块化设计、稳定的 API，性能得到了提升。

最后一点，Rails 有一个活跃而多元的社区。社区中有数以百计的开源项目[贡献者](http://contributors.rubyonrails.org/)，组织了很多[会议](http://railsconf.com/)，开发了大量的[插件](http://agilewebdevelopment.com/plugins)和 [gem](https://rubygems.org/)，很多内容丰富的博客，一些讨论组和 IRC 频道。有如此数量的 Rails 程序员也使得处理程序错误变的简单了：“使用 Google 搜索错误信息”的方法几乎总能搜到一篇相关的博客文章或讨论组的话题。

<h3 id="sec-1-1-1">1.1.1 给不同读者群的建议</h3>

本书的内容不仅只是讲解 Rails，还会涉及 Ruby 语言、RSPec 测试框架、[HTML](http://en.wikipedia.org/wiki/HTML)、[CSS](http://en.wikipedia.org/wiki/CSS)、少量的 [JavaScript](http://en.wikipedia.org/wiki/JavaScript) 和一些 [SQL](http://en.wikipedia.org/wiki/SQL)。所以不管你的 Web 开发技能处在什么层次，读完本书后你就能够继续学习一些较为高级的 Rails 资源了，同时也会对书中提到的其他技术有一个大体的认识。这么说也意味着要覆盖很多知识，如果你不是一个有些经验的程序员学起来会觉得有些吃力。下面就根据不同的开发背景给出使用本书的一些建议。

**所有读者：**学习 Rails 时一个常见的疑问是，是否要先学习 Ruby。这个问题的答案取决于你个人的学习方式以及你所具有的编程经验。如果你希望较为系统的从底向上学习，或者你以前从未编程过，那么先学 Ruby 或许更适合你，我推荐你阅读 Peter Cooper 的《[Ruby 入门](http://www.amazon.com/gp/product/1430223634)》一书。而很多 Rails 开发初学者很想立马就开始 Web 程序开发，而不是在此之前阅读一本 500 多页纯讲解 Ruby 的书。如果你是这类人群，我推荐你在 [Try Ruby](http://tryruby.org/)<sup>[2](#fn-2)</sup> 上学习一些阶段的交互式的教程，然后还可以看一下 [Rails for Zombies](http://railsforzombies.org/) <sup>[3](#fn-3)</sup> 这个免费的视频教程，看看 Rails 都能做些什么。

另外一个常见的疑问是，是否要在一开始就使用测试。就如前面的介绍所说的，本书会使用“测试驱动开发（也叫“先测试开发”）”理念，我认为这是使用 Rails 进行 Web 开打最好的方式，但这样也会增加难度和复杂度。如果你觉得做测试有些困难，我建议你在第一遍阅读时直接跳过所有测试，或者（更好的是）只把它们当做验证代码正确性的工具，而不管测试的机理。如果采用后一种方法，你要创建一些必要的测试文件（叫做 spec），然后将本书中提供的测试代码编写进去，然后运行这些测试用例（[第五章](chapter5.html)会介绍）得到失败消息，然后编写代码再运行测试让其通过。

**缺乏经验的程序员：**本书的主要读者群不是刚入门的程序员，Web 程序及其相关的任意一个技术都是很复杂的。如果你完全是个 Web 编程菜鸟，发现本书的内容太难了，我建议你先学习基本的 HTML 和 CSS（很可惜这两种技术我没有推荐的书籍，但是《深入潜出 HTML》应该不错，一个读者推荐 David Sawyer McFarland 的《CSS 实战手册》），然后再试着阅读本书。你也可以考虑先阅读 Peter Cooper 的《Ruby 入门》的前几章，这几章中的示例程序都比功能完善的 Web 程序小得多。不过也有一批初学者通过本书学会了 Web 开发，所以你不妨也试一下，而且我强烈推荐[本书配套的教学视频](http://railstutorial.org/screencasts) <sup>[4](#fn-4)</sup>，通过观看别人的操作来学习 Rails 开发。

**经验丰富的程序员，但是刚接触 Web 开发：**以前的经验说明你可能已经理解了类、方法、数据结构等概念，这是个好的开始。不过，如果你以前是 C/C++ 或 Java 程序员，你会觉得 Ruby 有点另类，需要花一段时间才能适应；慢慢的适应，你会习惯的。（如果你实在无法放弃使用行尾的分号，Ruby 允许你这么做）本书会为你介绍所有 Web 相关的概念，所以如果你现在并不知道 `PUT` 和 `POST` 的区别也不要紧。

**经验丰富的 Web 开发者，但是刚接触 Rails：**你有很好的基础了，如果你曾经使用过 PHP 或 Python（更好）这些动态语言就更好了。我们要将的基础都是一致的，但是你可能对 TDD 还有 Rails 采用的 REST 架构感到陌生。而且 Ruby 语言有自己的风格，这一点对你来说也是陌生的。

**经验丰富的 Ruby 程序员：**如今 Ruby 程序员不懂 Rails 的很少，如果你是这种情况，你可以快速的过一遍本书，然后接着阅读 Obie Fernandez 的《[Ruby 之道](http://www.amazon.com/gp/product/0321601661)》一书。

**缺乏经验的 Rails 程序员：**你或许阅读过其他的 Rails 教程，也开发过小型的 Rails 程序。根据一些读者的反馈，本书还是会给你带来帮助，别的不说，单就时效性而言，本书会比你当初学习 Rails 使用的教程要更新一些。

**经验丰富的 Rails 程序员：**你不需要阅读本书了，但是很多经验丰富的 Rails 开发者还是说道他们从本书中学到了很多，或许通过本书你会换个角度来看 Rails。

读完本书后，我建议经验丰富的程序员继续阅读 David A. Black 的《[The Well-Grounded Rubyist](http://www.amazon.com/gp/product/1933988657)》一书，这本书较为系统的对 Ruby 进行了深入的讨论；或者阅读 Hal Fulton 的《Ruby 之道》，这不是也是进阶书籍，不过更为专注在某些特定的话题上。然后再阅读《[Rails 3 之道](http://www.amazon.com/gp/product/0321601661)》来加强 Rails 技能。

不管你是从哪里开始的，这一过程结束后你就应该继续学习一些中高级 Rails 资源了。以下是我推荐的学习资源：

- [RailsCasts](http://railscasts.com/)，Ryan Bates：优秀的免费（大多数）视频教程
- [PeepCode](http://peepcode.com)：优秀的收费视频教程
- [Code School](http://www.codeschool.com/)：交互式的编程课程
- [Rails 官方指南](http://guides.rubyonrails.org/)：按话题编写经常更新的 Rails 参考
- [Ryan Bates 的 RailsCasts](http://railscasts.com/)：我是不是已经说过 RailsCasts了？真的，强烈推荐 RailsCasts。

<h3 id="sec-1-1-2">1.1.2 Rails 的性能</h3>

继续介绍之前，我想花点时间说明一下 Rails 框架发布初期的一个备受职责的问题：Rails 的性能很不好，例如不能处理较大量的访问量。这个问题之所以存在是因为有些人没搞清状况，性能要在你的网站中优化，而不是在框架中，强大的 Rails 只是一个框架而已。所以上面的问题应该换个角度来看：使用 Rails 开发的网站可以做性能优化吗？不管怎样这样的问题已经得到了肯定的回答，因为很多世界上访问量最大的网站就是用 Rails 开发的。实际上性能优化涉及到的不仅仅是 Rails，如果你的程序需要处理类似 Hulu 或 Yellow Pages 这种数量级的访问量，Rails 并不会拖你的后退。

<h3 id="sec-1-1-3">1.1.3 本书排版约定</h3>

本书中使用的排版约定很多都是不言自明的，在本节我要说一下那些意义不是很清晰的部分。

本书的 HTML 版和 PDF 版都包含了大量的链接，有内部各章节之间的链接（例如 [1.2](#sec-1-2)节），也有链接到其他网站的链接（例如[Ruby on Rails 下载](http://rubyonrails.org/download)页面）。

本书中很多例子都用到了命令行命令，为了行文方便，所有的命令行示例都使用了 Unix 风格的命令行提示符（美元符号），例如：

{% highlight sh %}
$ echo "hello, world"
hello, world
{% endhighlight %}

Windows 用户要知道在 Windows 中命令行的提示符是 `>`：

{% highlight sh %}
C:\Sites> echo "hello, world"
hello, world
{% endhighlight %}

在 Unix 系统中，一些命令要使用 `sudo`（超级用户的工作，“substitute user do”）执行。默认情况下，使用 `sudo` 执行的命令是以管理员的身份执行的，这样就能访问普通用户无法访问的文件和文件夹了。例如 [1.2.2 节](#sec-1-2-2)中的一个例子：

{% highlight sh %}
sudo ruby setup.rb
{% endhighlight %}

在多数的 Unix/Linux/OS X 系统中默认需要使用 `sudo`，但是如果使用 1.2.2.3 节中介绍的 Ruby 版本管理工具就没必要使用了，直接使用以下命令即可：

{% highlight sh %}
ruby setup.rb
{% endhighlight %}

Rails 附带了很多可以在命令行中运行的命令。例如，在 [1.2.5 节](#sec-1-2-5)中将使用下面的命令在本地运行一个开发服务器：

{% highlight sh %}
$ rails server
{% endhighlight %}

和命令提示符一样，本书也使用了 Unix 中使用的文件夹分隔符（例如，一个斜线 /）。例如，我的示例程序存放在：

{% highlight sh %}
/Users/mhartl/rails_projects/sample_app
{% endhighlight %}

在 Windows 中等价的文件夹可能是：

{% highlight sh %}
C:\Sites\sample_app
{% endhighlight %}

一个程序的根目录称为“Rails 根目录”，但是这个称呼很让一些人产生困惑，他们以为“Rails 根目录”使之 Rails 框架的根目录。为了避免歧义，本书在使用“程序根目录”替代“Rails 根目录”的称呼，程序中所有文件夹都是相对该文件夹的。例如，示例程序的 `config` 目录是：

{% highlight sh %}
/Users/mhartl/rails_projects/sample_app/config
{% endhighlight %}

这个程序的根目录就是 `config` 之前的部分：

{% highlight sh %}
/Users/mhartl/rails_projects/sample_app
{% endhighlight %}

为了方便，如果需要指向下面这个文件

{% highlight sh %}
/Users/mhartl/rails_projects/sample_app/config/routes.rb
{% endhighlight %}

我会省略前面的程序根目录，直接写成 `config/routes.rb`。

本书经常需要显示一些来自其他程序（命令行，版本控制系统，Ruby 程序等）的输出，因为系统之间存在差异，你所得到的输出结果可能和本书中的不同，但是无需担心。

你在使用某些命令时可能会导致一些错误的发生，我不会一一列举各个错误的解决方法，你可以自行通过 Google 搜索解决。如果你在学习本书的过程中遇到了问题，我建议你看一下[本书帮助页面](http://railstutorial.org/help) <sup>[6](#fn-6)</sup> 中列出的资源。

<h2 id="sec-1-2">1.2 搭建环境</h2>

> 我认为第一章就像法学院的“淘汰阶段”一样，如果你能成功的搭建开发环境，必然会事半功倍。
>
> -- 本书读者 Bob Cavezza

现在可以开始搭建 Ruby on Rails 开发环境并创建第一个程序了。本节的知识量比较大，特别是对于没有很多编程经验的人来说，所以如果在某个地方卡住了也不要灰心，不知你一个人如此，每个开发者都是从这一步走过来的，慢慢来，功夫不负有心人。

<h3 id="sec-1-2-1">1.2.1 开发环境</h3>

不同的人有不同的喜好，每个 Rails 程序员都有一套自己开发环境，但基本上分为两类：文本编辑器+命令行的环境，“集成开发环境”（IDE=Integrated Development Environment）。先来说说后一种。

<h4>IDE</h4>

Rails 并不缺乏 IDE，[RadRails](http://www.aptana.com/rails/)、[RubyMine](http://www.jetbrains.com/ruby/index.html) 和 [3rd Rails](http://www.codegear.com/products/3rdrail) 都是。我听说 RubyMine 不错，一个读者（David Loeffler）还总结了一篇文章讲解[如何结合本书使用 RubyMine](https://github.com/perfectionist/sample_project/wiki) <sup>[7](#fn-7)</sup>。

<h4>文本编辑器和命令行</h4>

较之 IDE，我喜欢使用文本编辑器编辑文本，使用命令行执行命令（如图 1.1）。如何组合取决于你的喜好和所用的平台。

- **文本编辑器：**我推荐使用 [Sublime Text 2](http://www.sublimetext.com/2)，这是一个跨平台支持的文本编辑器，写作本书时还处于 Beta 测试阶段，即便如此还是被认为是异常强大的编辑器。Sublime Text 深受 [Textmate](http://macromates.com/) 的影响，它能兼容大多数 Textmate 的定制功能，例如代码片段和配色方案。（Textmate 只可在 OS X 中使用，如果你使用 Mac 的话，它仍然是一个很好的选择。）另外一个很好的选择是 [Vim](http://www.vim.org/) <sup>[8](#fn-8)</sup>，它有针对各种主要平台的版本。Sublime Text 需要付费，而 Vim 则是免费的。二者都是界内人士普遍使用的编辑器，但就我的经验而言，Sublime Text 对初学者更友好。
- **终端（命令行）：**OS X 系统中我推荐使用 [iTerm](http://iterm.sourceforge.net/) 或是内置的终端程序。Linux 系统默认的终端就很好。在 Windows 中，很多用户选择在虚拟机中运行 Linux 来开发 Rails 程序，那么终端就使用默认的好了。如果你是在全 Windows 系统中开发，我推荐使用 [Rails Installer](http://railsinstaller.org/) 中附带的终端（[1.2.2.1 节](#sec-1-2-2-1)）。

如果你决定使用 Sublime Text，你可以参照[针对本书的安装说明](https://github.com/mhartl/rails_tutorial_sublime_text) <sup>[9](#fn-9)</sup>来安装。

![figure 1.1](assets/images/figures/editor_shell.png)

<p class="caption">图 1.1 一种文本编辑器和命令行的开发环境（TextMate 和 iTerm）</p>

<h4>浏览器</h4>

虽然浏览器有很多选择，但是大多数的 Rails 开发者使用 Firefox、Safari 或 Chrome 进行开发。本书附带的教程视频中使用的是 Firefox，如果你也使用 Firefox，推荐你安装 [Firebug](http://getfirebug.com/) 扩展，这个扩展很强大，可以动态的查看或编辑任何页面的 HTML 结构和 CSS。如果你不使用 Firefox，Safari 和 Chrome 都内置了“查看元素”功能，在任意页面右键鼠标就能找到。

<h4>关于工具的一点说明</h4>

在搭建开发环境的过程中，你会发现花费了很多时间来熟悉各种工具。特别是学习编辑器和 IDE，需要花费特别长的时间。单单用在 Sublime Text 和 Vim 教程上的时间就可能是几个星期。如果你刚刚接触这一领域，我要告诉你，学习工具要花费时间是正常的。每个人都是这样过来的。有时你会抓狂，当你在脑中有了很好的程序构思时，你之象学习 Rails，但却要浪费一个星期去学习老旧的 Unix 编辑器，这时很容易失去耐心。但请记住，工欲善其事必先利其器。

<h3 id="sec-1-2-2">1.2.2 安装 Ruby，RubyGems，Rails 和 Git</h3>

> 世界上几乎所有的软件不是无法使用就是很难使用。所以用户惧怕软件。用户们已经得到经验了，不论是安装软件还是填写一个在线表格，都不会成功。我也害怕安装东西，可笑的是我是个计算机科学博士。
>
> -- Paul Graham，《创业者》

现在可以安装 Ruby on Rails 了。我会尽量讲得浅一点，但是系统之间存在差异，很多地方都可能出现问题，如果你遇到问题的话请通过 Google 搜索，或访问[本书的帮助页面](http://railstutorial.org/help)。

除非有特殊说明，你应该使用本书中所有软件的相同版本，包括 Rails，这样才能得到相同的结果。有时候不同的次版本会产生相同的结果，但这样做是不对的，特别是针对 Rails 的版本。不过 Ruby 是个例外，1.9.2 和 1.9.3 都可以用于本教程，所以二者随意选择。

<h4>Rails Installer（Windows）</h4>

以前在 Windows 中安装 Rails 是件很痛苦的事，但多亏了 [Engine Yard](http://engineyard.com/) 公司的大牛们，特别是 Nic Williams 博士和 Wayne E. Seguin，现在这 Windows 中安装 Rails 及相关的软件简单多了。如果你使用 Windows 的话，可以到 [Rails Installer 的网站](http://railsinstaller.org/)下载 Rails Installer 安装程序，顺便可以看一下安装视频。双击安装文件按照说明安装 Git、Ruby、RubyGems 和 Rails。安装完成后你就可以直接跳到 [1.2.3 节](#sec-1-2-3)去创建第一个应用程序了。

有一点需要说明，使用 Rails Installer 安装的 Rails 版本可能和下面介绍的方法版本不一致，这可能会导致不兼容的问题。为了解决这个问题，我想在正在与 Nic 和 Wayne 一起工作，按照 Rails 版本号的顺序列出一个 Rails Installer 列表。

<h4>安装 Git</h4>

Rails 社区中的人多少都会使用一个叫 Git（[1.3 节](#sec-1-3）中会详细介绍）的版本控制系统，因为大家都这么做，所以你在一开始就要开始用 Git。如何在你使用的平台中安装 Git 可以参考[《Pro Git》书中的“安装 Git”一节](http://git-scm.com/book/zh/%E8%B5%B7%E6%AD%A5-%E5%AE%89%E8%A3%85-Git)。

<h4>安装 Ruby</h4>

接下来要安装 Ruby 了。很有可能你使用的系统已经自带了 Ruby，你可以执行下面的命令来看一下：

{% highlight sh %}
$ ruby -v
ruby 1.9.3
{% endhighlight %}

这个命令会显示 Ruby 的版本。Rails 3 需要使用 Ruby 1.8.7 或以上的版本，但最好是 1.9.x 系列。本教程假设多数的读者使用的是 Ruby 1.9.2 或 1.9.3，不过 Ruby 1.8.7 应该也可以用（第四章中会介绍，这个版本和最新版之间有个语法差异，而且也会导致输出有细微的差别）。

如果你使用的是 OS X 或者 Linux，在安装 Ruby 时我强烈建议使用 Ruby 版本管理工具 [RVM](http://rvm.io/)，它允许你在同一台电脑上安装并管理多个 Ruby 版本。（在 Windows 中可以使用 [Pik](http://github.com/vertiginous/pik)）如果你希望在同一台电脑中运行不同版本的 Ruby 或 Rails 就需要它了。如果你在使用 RVM 时遇到什么问题的话，可以在 RVM 的 IRC 频道（[freenode.net 上的 #rvm](http://webchat.freenode.net/?channels=rvm)）中询问它的开发者 Wayne E. Seguin。<sup>[10](#fn-10)</sup>如果你使用的是 Linux，我推荐你阅读 [Sudobits 博客中的《如何在 Ubuntu 中安装 Ruby on Rails》一文](http://blog.sudobits.com/2012/05/02/how-to-install-ruby-on-rails-in-ubuntu-12-04-lts/)。

[安装 RVM](http://rvm.io/rvm/install/) 后，你可以按照下面的方式安装 Ruby：<sup>[11](#fn-11)</sup>

{% highlight sh %}
$ rvm get head && rvm reload
$ rvm install 1.9.3
<等一会儿>
{% endhighlight %}

命令的第一行会更新并重新加载 RVM，这是个好习惯，因为 RVM 经常会更新。第二行命令安装 Ruby 1.9.3。然后会用花一些时间下载和编译，所以如果看似没反应了也不要担心。

一些 OS X 用户可能会因为没有 `autoconf` 执行文件而麻烦一些，不过你可以安装 [Homebrew](http://mxcl.github.com/homebrew/) <sup>[12](#fn-12)（OS X 系统中的包管理程序），然后执行以下命令：

{% highlight sh %}
$ brew install automake
$ rvm install 1.9.3
{% endhighlight %}

有些 Linux 用户反馈说要包含 OpenSSL 代码库的路径：

{% highlight sh %}
$ rvm install 1.9.3 --with-openssl-dir=$HOME/.rvm/
{% endhighlight %}

在一些较旧的 OS X 系统中，你或许要包含 `readline` 代码库的路径：

{% highlight sh %}
$ rvm install 1.9.3 --with-readline-dir=/opt/local
{% endhighlight %}

（就像我说过的，很多地方都可能会出错，唯一的解决办法就是网络搜索，然后自己解决。）

安装 Ruby 之后，你要配置一下你的系统，这样其他才能运行 Rails 程序。这个过程会设计到 gem 的安装，gem 是 Ruby 代码的打包系统。因为不同版本的 gem 会有差异，我们经常要创建一个额外的 gem 集（gemset），包含一系列的 gem。针对本教程，我推荐你创建一个名为 `rails3tutorila2ndEd` 的 gemset：

{% highlight sh %}
$ rvm use 1.9.3@rails3tutorial2ndEd --create --default
Using /Users/mhartl/.rvm/gems/ruby-1.9.3 with gemset rails3tutorial2ndEd
{% endhighlight %}

上面的命令会使用 Ruby 1.9.3 创建（`--create`）一个名为 `rails3tutorial2ndEd` 的 gemset，然后立马就开始使用（`use`） 这个 gemset，并将其设为默认的（`--default`） gemset，这样每次打开新的终端就会自动使用 `1.9.3@rails3tutorial2ndEd` 这个 Ruby 和 gemset 的组合。RVM 提供了大量的命令用来处理 gemset，更多内容可以查看其文档（<http://rvm.io/gemsets/>）。如果你在使用 RVM 时遇到了问题，可以运行以下的命令显示帮助信息：

{% highlight sh %}
$ rvm --help
$ rvm gemset --help
{% endhighlight %}
