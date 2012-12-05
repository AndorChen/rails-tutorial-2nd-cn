---
layout: chapter
title: 第八章 登录和退出
---

[第七章](chapter7.html)已经实现了注册新用户的功能，本章我们要为已注册的用户提供登录和退出功能。实现登录功能之后，就可以根据登录状态和当前用户的身份定制网站的内容了。例如，本章我们会更新网站的头部，显示“登录”或“退出”链接，以及到个人资料页面的链接；在第十章中，会根据当前登录用户的 id 创建关联到这个用户的微博；在第十一章，我们会实现当前登录用户关注其他用户的功能，实现之后，在首页就可以显示被关注用户发表的微博了。

实现登录功能之后，还可以实现一种安全机制，即根据用户的身份限制可以访问的页面，例如，在[第九章](chapter9.html)中会介绍如何实现只有登录后才能访问编辑用户资料的页面。登录系统还可以赋予管理员级别的用户特别的权限，例如删除用户（也会在[第九章](chapter9.html)中实现）等。

实现验证系统的核心功能之后，我们会简要的介绍一下 Cucumber 这个流行的行为驱动开发（Behavior-driven Development, BDD）系统，使用 Cucumber 重新实现之前的一些 RSpec 集成测试，看一下这两种方式有何不同。

和之前的章节一样，我们会在一个新的从分支中工作，本章结束后再将其合并到主分支中：

{% highlight sh %}
$ git checkout -b sign-in-out
{% endhighlight %}

<h2 id="sec-8-1">8.1 session 和登录失败</h2>

[session](http://en.wikipedia.org/wiki/Session_(computer_science)) 是两个电脑（例如运行有网页浏览器的客户端电脑和运行 Rails 的服务器）之间的半永久性连接，我们就是利用它来实现登录过程中常见问题的。网络中常见的 session 处理方式有好几种：可以在用户关闭浏览器后清除 session；也可以提供一个“记住我”单选框让用户选择持久性的 session，直到用户退出后 session 才会失效。<sup>[1](#fn-1)</sup> 在示例程序中我们选择使用第二中处理方式，即用户登录后，会永久的记住登录状态，知道用户点击“退出”链接之后才清除 session。（在 [8.2.1 节](#sec-8-2-1)中会介绍“永久”到底有多久。）

很显然，我们可以把 session 视作一个符合 REST 架构的资源，在登录页面中准备一个新的 session，登录后创建这个 session，退出则会销毁 session。不过 session 和 Users 资源有所不同，Users 资源使用数据库（通过 User 模型）持久的存储数据，而 Sessions 资源是利用 [cookie](http://en.wikipedia.org/wiki/HTTP_cookie) 来存储数据的。cookie 是存储在浏览器中的少量文本。实现登录功能基本上就是在实现基于 cookie 的验证机制。在本节及接下来的一节中，我们会构建 Sessions 控制器，创建登录表单，还会实现控制器中相关的动作。在 [8.2 节](#sec-8-2)中会加入处理 cookie 所需的代码。

<h3 id="sec-8-1-1">8.1.1 Sessions 控制器</h3>

登录和退出功能其实是由 Sessions 控制器中相应的动作处理的，登录表单在 `new` 动作中处理（本节的内容），登录的过程就是向 `create` 动作发送 `POST` 请求（[8.1 节](#sec-8-1)和 [8.2 节](#sec-8-2)），退出则是向 `destroy` 动作发送 `DELETE` 请求（[8.2.6 节]）。（HTTP 请求和 REST 动作之间的对应关系可以参看[表格 7.1](chapter7.html#sec-7-1)。）首先，我们要生成 Sessions 控制器，以及验证系统所需的集成测试：

{% highlight sh %}
$ rails generate controller Sessions --no-test-framework
$ rails generate integration_test authentication_pages
{% endhighlight %}

参照 [7.2 节](chapter7.html#sec-7-2)中的“注册”页面，我们要创建一个登录表单生成新的 session。注册表单的构思图如图 8.1 所示。

“登录”页面的地址由 `singin_path`（稍后定义）获取，和之前一样，我们要先编写适量的测试，如代码 8.1 所示。（可以和代码 7.6 中对“注册”页面的测试比较一下。）

![signin_mockup_bootstrap](assets/images/figures/signin_mockup_bootstrap.png)

图 8.1：注册表单的构思图

**代码 8.1** 对 `new` 动作和对应视图的测试<br />`spec/requests/authentication_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Authentication" do

  subject { page }

  describe "signin page" do
    before { visit signin_path }

    it { should have_selector('h1',    text: 'Sign in') }
    it { should have_selector('title', text: 'Sign in') }
  end
end
{% endhighlight %}

现在测试是失败的：

{% highlight sh %}
$ bundle exec rspec spec/
{% endhighlight %}

要让代码 8.1 中的测试通过，首先，我们要为 Sessions 资源设置路由，还要修改“登录”页面具名路由的名称，将其映射到 Sessions 控制器的 `new` 动作上。和 Users 资源一样，我们可以使用 `resources` 方法设置标准的 REST 动作：

{% highlight ruby %}
resources :sessions, only: [:new, :create, :destroy]
{% endhighlight %}

因为我们没必要显示或编辑 session，所以我们对动作的类型做了限制，为 `resources` 方法指定了 `:only` 选项，只创建 `new`、`create` 和 `destroy` 动作。最终的结果，包括登录和退出具名路由的设定，如代码 8.2 所示。

**代码 8.2** 设置 session 相关的路由<br />`config/routes.rb`

{% highlight ruby %}
SampleApp::Application.routes.draw do
  resources :users
  resources :sessions, only: [:new, :create, :destroy]

  match '/signup', to: 'users#new'
  match '/signin', to: 'sessions#new'
  match '/signout', to: 'sessions#destroy', via: :delete
  .
  .
  .
end
{% endhighlight %}

注意，设置退出路由那行使用了 `via :delete`，这个参数指明 `destroy` 动作要使用 `DELETE` 请求。

代码 8.2 中的路由设置会生成类似[表格 7.1](chapter7.html#table-7-1) 所示的URI 地址和动作的对应关系，如[表格 8.1](#table-8-1) 所示。注意，我们修改了登录和退出具名路由，而创建 session 的路由还是使用默认值。

为了让代码 8.1 中的测试通过，我们还要在 Sessions 控制器中加入 `new` 动作，相应的代码如代码 8.3 所示（同时也定义了 `create` 和 `destroy` 动作）。

<table id="table-8-1" class="tabular">
  <tbody>
    <tr>
      <th class="align_left"><strong>HTTP 请求</strong></th>
      <th class="align_left"><strong>URI 地址</strong></th>
      <th class="align_left"><strong>具名路由</strong></th>
      <th class="align_left"><strong>动作</strong></th>
      <th class="align_left"><strong>目的</strong></th>
    </tr>
    <tr class="top_bar">
      <td class="align_left"><tt>GET</tt></td>
      <td class="align_left">/signin</td>
      <td class="align_left"><code>signin_path</code></td>
      <td class="align_left"><code>new</code></td>
      <td class="align_left">创建新 session 的页面（登录）</td>
    </tr>
    <tr>
      <td class="align_left"><tt>POST</tt></td>
      <td class="align_left">/sessions</td>
      <td class="align_left"><code>sessions_path</code></td>
      <td class="align_left"><code>create</code></td>
      <td class="align_left">创建 session</td>
    </tr>
    <tr>
      <td class="align_left"><tt>DELETE</tt></td>
      <td class="align_left">/signout</td>
      <td class="align_left"><code>signout_path</code></td>
      <td class="align_left"><code>destroy</code></td>
      <td class="align_left">删除 session（退出）</td>
    </tr>
  </tbody>
</table>

表格 8.1：代码 8.2 中的设置生成的符合 REST 架构的路由关系

**代码 8.3** 没什么内容的 Sessions 控制器<br />`app/controllers/sessions_controller.rb`

{% highlight ruby %}
class SessionsController < ApplicationController
  def new
  end

  def create
  end

  def destroy
  end
end
{% endhighlight %}

接下来还要创建“登录”页面的视图，因为“登录”页面的目的是创建新 session，所以创建的视图位于 `app/views/sessions/new.html.erb`。在视图中我们要显示网页的标题和一个一级标头，如代码 8.4 所示。

**代码 8.4 “登录”页面的视图<br />`app/views/sessions/new.html.erb`

{% highlight erb %}
<% provide(:title, "Sign in") %>
<h1>Sign in</h1>
{% endhighlight %}

现在代码 8.1 中的测试应该可以通过了，接下来我们要编写登录表单的结构。

{% highlight sh %}
$ bundle exec rspec spec/
{% endhighlight %}

<h3 id="sec-8-1-2">8.1.2 测试登录功能</h3>

对比图 8.1 和图 7.11 之后，我们发现登录表单和注册表单外观上差不过，只是少了两个字段，只有 Email 地址和密码字段。和注册表单一样，我们可以使用 Capybara 填写表单再点击按钮进行测试。

在测试的过程中，我们不得不向程序中加入相应的功能，这也正式 TDD 带来的好处之一。我们先来测试填写不合法数据的登录过程，构思图如图 8.2 所示。

![signin_failure_mockup_bootstrap](assets/images/figures/signin_failure_mockup_bootstrap.png)

图 8.2：注册失败页面的构思图

从图 8.2 我们可以看出，如果提交的数据不正确，我们会重新渲染“注册”页面，还切会显示一个错误提示消息。这个错误提示是 Flash 消息，我们可以通过下面的测试验证：

{% highlight ruby %}
it { should have selector('div.alert.alert-error', text: 'Invalid') }
{% endhighlight %}

（在[第七章](chapter7.html)练习中的代码 7.32 中出现过类似的代码。）我们要查找的元素是：

{% highlight text %}
div.alert.alert-error
{% endhighlight %}

我们之前介绍过，这里的点号代表 CSS 中的 class（参见 [5.1.2 节](chapter5.html#sec-5-1-2)），你也许猜到了，这里我们要查找的是同时具有 `alert` 和 `alert-error` class 的 `div` 元素。而且我们还检测了错误提示消息中是否包含了 `"Invalid"` 这个词。所以，上述的测试代码是检测下面是否有下面这种元素的：

{% highlight html %}
<div class="alert alert-error">Invalid...</div>
{% endhighlight %}

代码 8.5 显示的是包含了测试标题和测试 Flash 消息的测试代码。我们可以看出，这些代码缺少了一个很重要的部分，会在 [8.1.5 节](#sec-8-1-5)中说明。

**代码 8.5** 登录失败时的测试<br />`spec/requests/authentication_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Authentication" do
  .
  .
  .
  describe "signin" do
    before { visit signin_path }

    describe "with invalid information" do
      before { click_button "Sign in" }

      it { should have_selector('title', text: 'Sign in') }
      it { should have_selector('div.alert.alert-error', text: 'Invalid') }
    end
  end
end
{% endhighlight %}

测试了登录失败的情况，下面我们要测试登录成功的情况了。我们要测试登录成功后是否转向了用户资料页面（从页面的标题判断，标题中应该包含用户的名字），还要测试网站的导航中是否有以下三个变化：

1. 出现了指向用户资料页面的链接
2. 出现了“退出”链接
3. “登录”链接消失了

（对“设置（Settings）”链接的测试会在 [9.1 节](chapter9.html#9-1)中实现，对“所有用户（Users）”链接的测试会在 [9.3 节](chapter9.html#sec-9-3)中实现。）如上变化的构思图如图 8.3 所示。<sup>[2](#fn-2)</sup>注意，退出和个人资料链接出现在“账户（Account）”下拉菜单中。在 [8.2.4 节](#sec-8-2-4)中会介绍如何通过 Bootstrap 实现这种下拉菜单。

![signin_success_mockup_bootstrap](assets/images/figures/signin_success_mockup_bootstrap.png)

图 8.3：登录成功后显示的用户资料页面构思图

对登录成功时的测试代码如代码 8.6 所示。

**代码 8.6** 登录成功时的测试<br />`spec/requests/authentication_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Authentication" do
  .
  .
  .
  describe "signin" do
    before { visit signin_path }
    .
    .
    .
    describe "with valid information" do
      let(:user) { FactoryGirl.create(:user) }
      before do
       fill_in "Email", with: user.email
       fill_in "Password", with: user.password
       click_button "Sign in"
      end

      it { should have_selector('title', text: user.name) }
      it { should have_link('Profile', href: user_path(user)) }
      it { should have_link('Sign out', href: signout_path) }
      it { should_not have_link('Sign in', href: signin_path) }
    end
  end
end
{% endhighlight %}

在上面的代码中用到了 `have_link` 方法，它的第一参数是链接的文本，第二个参数是可选的 `:href`，指定链接的地址，因此如下的代码

{% highlight ruby %}
it { should have_link('Profile', href: user_path(user)) }
{% endhighlight %}

确保了页面中有一个 `a` 元素，链接到指定的 URI 地址。这里我们要检测的是一个指向用户资料页面的链接。

<h3 id="sec-8-1-3">8.1.3 登录表单</h3>

写完测试之后，我们就可以创建登录表单了。在代码 7.17 中，注册表单使用了 `form_for` 帮助函数，并指定其参数为 `@user` 变量：

{% highlight erb %}
<%= form_for(@user) do |f| %>
.
.
.
<% end %>
{% endhighlight %}

注册表单和登录表单的区别在于，程序中没有 Session 模型，因此也就没有和 `@user` 类似的变量。也就是说，在构建登录表单时，我们要给 `form_for` 提供更多的信息。一般来说，如下的代码

{% highlight erb %}
form for(@user)
{% endhighlight %}

Rails 会自动向 /users 地址发送 `POST` 请求。对于登录表单，我们则要明确的指定资源的名称已经相应的 URI 地址：

{% highlight erb %}
form_for(:session, url: sessions_path)
{% endhighlight %}

（第二种方法是，不用 `form_for`，而用 `form_tag`。`form_tag` 也是 Rails 程序常用的方法，不过换用 `form_tag` 之后就和注册表单有很多不同之处了，我现在是想使用相似的代码构建登录表单。使用 `form_tag` 构建登录表单会留作练习（参见 [8.5 节](#sec-8-5)）。）

使用上述这种 `form_for` 形式，我们可以参照代码 7.17 中的注册表单，很容易的就能编写一个符合图 8.1 的登录表单，如代码 8.7 所示。

**代码 8.7** 注册表单的代码<br />`app/views/sessions/new.html.erb`

{% highlight erb %}
<% provide(:title, "Sign in") %>
<h1>Sign in</h1>

<div class="row">
  <div class="span6 offset3">
    <%= form_for(:session, url: sessions_path) do |f| %>

      <%= f.label :email %>
      <%= f.text_field :email %>

      <%= f.label :password %>
      <%= f.password_field :password %>

      <%= f.submit "Sign in", class: "btn btn-large btn-primary" %>
    <% end %>

    <p>New user? <%= link_to "Sign up now!", signup_path %></p>
  </div>
</div>
{% endhighlight %}

注意，为了访客的便利，我们还加入了到“注册”页面的链接。代码 8.7 中的登录表单效果如图 8.4 所示。

![signin_form_bootstrap](assets/images/figures/signin_form_bootstrap.png)

图 8.4：登录表单（[/signup](http://localhost:3000/signin)）

时间久了你就不会老是查看 Rails 生成的 HTML（你会完全信任所用的帮助函数可以正确的完成任务），不过现在还是来看一下登录表单的 HTML 吧（如代码 8.8 所示）。

**代码 8.8** 代码 8.7 中登录表单生成的 HTML

{% highlight html %}
<form accept-charset="UTF-8" action="/sessions" method="post">
  <div>
    <label for="session_email">Email</label>
    <input id="session_email" name="session[email]" size="30" type="text" />
  </div>
  <div>
    <label for="session_password">Password</label>
    <input id="session_password" name="session[password]" size="30"
           type="password" />
  </div>
  <input class="btn btn-large btn-primary" name="commit" type="submit"
         value="Sign in" />
</form>
{% endhighlight %}

你可以对比一下代码 8.8 和代码 7.20。你可能已经猜到了，提交登录表单后会生成一个 `params` Hash，其中 `params[:session][:email]` 和 `params[:session][:password]` 分别对应了 Email 和密码字段。

<h3 id="sec-8-1-4">8.1.4 分析表单提交</h3>

和创建用户类似，创建 session 时先要处理提交不合法数据的情况。我们已经编写了对提交不合法数据的测试（参见代码 8.5），也添加了有几处难理解但还算简单的代码让测试通过了。下面我们就来分析一下表单提交的过程，然后为登录失败添加失败提示信息（如图 8.2）。然后，以此为基础，验证提交的 Email 和密码，处理登录成功的情况（参见 [8.2 节](#sec-8-2)）。

首先，我们来编写 Sessions 控制器的 `create` 动作，如代码 8.9 所示，现在只是直接渲染登录页面。在浏览器中访问 /sessions/new，然后提交空表单，显示的页面如图 8.5 所示。

![initial_failed_signin_rails_3_bootstrap](assets/images/figures/initial_failed_signin_rails_3_bootstrap.png)

图 8.5：代码 8.9 中的 `create` 动作显示的登录失败后的页面

**代码 8.9** Sessions 控制器中 `create` 动作的初始版本<br />`app/controllers/sessions_controller.rb`

{% highlight ruby %}
class SessionsController < ApplicationController
  .
  .
  .
  def create
    render 'new'
  end
  .
  .
  .
end
{% endhighlight %}

仔细的查看一下图 8.5 中显示的调试信息，你会发现，如在 [8.1.3 节](#sec-8-1-3)末尾说过的，表单提交后会生成 `params` Hash，Email 和密码都至于 `:session` 键之中：

{% highlight yaml %}
---
session:
  email: ''
  password: ''
commit: Sign in
action: create
controller: sessions
{% endhighlight %}

和注册表单类似，这些参数是一个嵌套的 Hash，在代码 4.6 中见过。`params` 包含了如下的嵌套 Hash：

{% highlight ruby %}
{ session: { password: "", email: "" } }
{% endhighlight %}

也就是说

{% highlight ruby %}
params[:session]
{% endhighlight %}

本身就是一个 Hash：

{% highlight ruby %}
{ password: "", email: "" }
{% endhighlight %}

所以，

{% highlight ruby %}
params[:session][:email]
{% endhighlight %}

就是提交的 Email 地址，而

{% highlight ruby %}
params[:session][:password]
{% endhighlight %}

就是提交的密码。

也就是说，在 `create` 动作中，`params` 包含了使用 Email 和密码验证用户身份所需的全部数据。幸运的是，我们已经定义了身份验证过程中所需的两个方法，即由 Active Record 提供的 `User.find_by_email`（参见 [6.1.4 节](chapter6.html#sec-6-1-4)），以及由 `has_secure_password` 提供的 `authenticate` 方法（参见 [6.3.3 节](chapter6.html#sec-6-3-3)）。我们之前介绍过，如果提交的数据不合法，`authenticate` 方法会返回 `false`。基于以上的分析，我们计划按照如下的方式实现用户登录功能：

{% highlight ruby %}
def create
  user = User.find_by_email(params[:session][:email])
  if user && user.authenticate(params[:session][:password])
    # Sign the user in and redirect to the user's show page.
  else
    # Create an error message and re-render the signin form.
  end
end
{% endhighlight %}

`create` 动作的第一行，使用提交的 Email 地址从数据库中取出相应的用户。第二行是 Ruby 中经常使用的语句形式：

{% highlight ruby %}
user && user.authenticate(params[:session][:password])
{% endhighlight %}

我们使用 `&&`（逻辑与）检测获取的用户是否合法。因为除了 `nil` 和 `false` 之外的所有对象都被视作 `true`，上面这个语句可能出现的结果如[表格 8.2](#table-8-2)所示。我们可以从表格 8.2 中看出，当且仅当数据库中存在提交的 Email 和提交了对应的密码时，这个语句才会返回 `true`。

<table id="table-8-2" class="tabular">
  <tbody>
    <tr>
      <th class="align_left"><strong>用户</strong></th>
      <th class="align_left"><strong>密码</strong></th>
      <th class="align_left"><strong>a &amp;&amp; b</strong></th>
    </tr>
    <tr class="top_bar">
      <td class="align_left">不存在</td>
      <td class="align_left"><em>任意值</em></td>
      <td class="align_left"><code>nil &amp;&amp; [anything] == false</code></td>
    </tr>
    <tr>
      <td class="align_left">存在</td>
      <td class="align_left">错误的密码</td>
      <td class="align_left"><code>true &amp;&amp; false == false</code></td>
    </tr>
    <tr>
      <td class="align_left">存在</td>
      <td class="align_left">正确的密码</td>
      <td class="align_left"><code>true &amp;&amp; true == true</code></td>
    </tr>
  </tbody>
</table>

表格 8.2：`user && user.authenticate(...)` 可能出现的结果

<h3 id="sec-8-1-5">8.1.5 显示 Flash 消息</h3>

在 [7.3.2 节](chapter7.html#sec-7-3-2)中，我们使用 User 模型的数据验证信息来显示注册失败时的提示信息。这些错误提示信息是关联在某个 Active Record 对象上的，不过这种方式不可以用在 session 上，因为 session 不是 Active Record 模型。我们要采取的方法是，在登录失败时，把错误提示信息赋值给 Flash 消息。代码 8.10 显示的是我们首次尝试实现这种方法所用的代码，其中有个小小的错误。

**代码 8.10** 尝试处理登录失败（有个小小的错误）<br />`app/controllers/sessions_controller.rb`

{% highlight ruby %}
class SessionsController < ApplicationController

  def new
  end

  def create
    user = User.find_by_email(params[:session][:email])
    if user && user.authenticate(params[:session][:password])
      # Sign the user in and redirect to the user's show page.
    else
      flash[:error] = 'Invalid email/password combination' # Not quite right!
      render 'new'
    end
  end

  def destroy
  end
end
{% endhighlight %}

布局中已经加入了显示 Flash 消息的局部视图，所以无需其他修改，上述 Flash 错误提示消息就会显示出来，而且因为使用了 Bootstrap，这个错误消息的样式也很美观（如图 8.6）。

![failed_signin_flash_bootstrap](assets/images/figures/failed_signin_flash_bootstrap.png)

图 8.6：登录失败后显示的 Flash 消息

不过，就像代码 8.10 中的注释所说，这些代码还有问题。显示的页面开起来很正常啊，那么，问题出现在哪儿呢？问题的关键在于，Flash 消息在一个请求的生命周期内是持续存在的，而重新渲染页面（使用 `render` 方法）和代码 7.27 中的转向不同，它不算新的请求，我们会发现这个 Flash 消息存在的时间比设想的要长很多。例如，我们提交了不合法的登录信息，Flash 消息生成了，然后在注册页面中显示出来（如图 8.6），这时如果我们点击链接转到其他页面（例如“首页”），这就算是表单提交后的第一次请求，所以页面中还是会显示这个 Flash 消息（如图 8.7）。

![flash_persistence_bootstrap](assets/images/figures/flash_persistence_bootstrap.png)

图 8.7：仍然显示有 Flash 消息的页面

Flash 消息没有按预期消失算是程序的一个 bug，在修正之前，我们最好编写一个测试来捕获这个错误。现在，登录失败时的测试是可以通过的：

{% highlight sh %}
$ bundle exec rspec spec/requests/authentication pages spec.rb \
> -e "signin with invalid information"
{% endhighlight %}

不过有错误的程序测试应该是失败的，所以我们要编写一个能够捕获这种错误的测试。幸好，捕获这种错误正是集成测试的拿手好戏，相应的代码如下：

{% highlight ruby %}
describe "after visiting another page" do
  before { click_link "Home" }
  it { should_not have_selector('div.alert.alert-error') }
end
{% endhighlight %}

提交不合法的登录信息之后，这个测试用例会点击网站中的“首页”链接，期望显示的页面中没有 Flash 错误消息。添加上述测试用例的测试文件如代码 8.11 所示。

**代码 8.11** 登录失败时的合理测试<br />`spec/requests/authentication_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Authentication" do
  .
  .
  .
  describe "signin" do
    before { visit signin_path }

    describe "with invalid information" do
      before { click_button "Sign in" }

      it { should have_selector('title', text: 'Sign in') }
      it { should have_selector('div.alert.alert-error', text: 'Invalid') }

      describe "after visiting another page" do
        before { click_link "Home" }
        it { should_not have_selector('div.alert.alert-error') }
      end
    end
    .
    .
    .
  end
end
{% endhighlight %}

新添加的测试和预期一致，是失败的：

{% highlight sh %}
$ bundle exec rspec spec/requests/authentication pages spec.rb \
> -e "signin with invalid information"
{% endhighlight %}

要让这个测试通过，我们要用 `flash.now` 替换 `flash`。`flash.now` 就是专门用来在重新渲染的页面中显示 Flash 消息的，在发送新的请求之后，Flash 消息便会消失。正确的 `create` 动作代码如代码 8.12 所示。

**代码 8.12** 处理登录失败所需的正确代码<br />`app/controllers/sessions_controller.rb`

{% highlight ruby %}
class SessionsController < ApplicationController

  def new
  end

  def create
    user = User.find_by_email(params[:session][:email])
    if user && user.authenticate(params[:session][:password])
      # Sign the user in and redirect to the user's show page.
    else
      flash.now[:error] = 'Invalid email/password combination'
      render 'new'
    end
  end

  def destroy
  end
end
{% endhighlight %}

现在登录失败时的所有测试应该都可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/authentication pages spec.rb \
> -e "with invalid information"
{% endhighlight %}

<h2 id="sec-8-2">8.2 登录成功</h2>

上一节处理了登录失败的情况，这一节我们要处理登录成功的情况了。实现用户登录的过程是本书目前为止最考验 Ruby 编程能力的部分，所以你要坚持读完本节，最好准备，付出大量的脑力劳动。幸好，第一步还算是简单的，完成 Sessions 控制器的 `create` 动作没什么难的，不过还是需要一点小技巧。

我们需要把代码 8.12 中处理登录成功分支中的注释换成具体的代码，我们要使用 `sign_in` 方法实现登录操作，然后转向到用户的资料页面，所需的代码如代码 8.13 所示。这就是我们使用的技巧，使用还没定义的方法 `sign_in`。本节后面的内容会定义这个方法。

**代码 8.13** 完整的 `create` 动作代码（还不能正常使用）<br />`app/controllers/sessions_controller.rb`

{% highlight ruby %}
class SessionsController < ApplicationController
  .
  .
  .
  def create
    user = User.find_by_email(params[:session][:email])
    if user && user.authenticate(params[:session][:password])
      sign_in user
      redirect_to user
    else
      flash.now[:error] = 'Invalid email/password combination'
      render 'new'
    end
  end
  .
  .
  .
end
{% endhighlight %}

<h3 id="sec-8-2-1">8.2.1 “记住我”</h3>

现在我们要开始实现登录功能了，第一步是实现“记住我”这个功能，即用户登录的状态会被“永远”记住，直到用户点击“退出”链接为止。实现登录功能用到的函数已经超越了传统的 MVC 架构，其中一些函数要同时在控制器和视图中使用。在[4.2.5 节](chapter4.html#sec-4-2-5)中介绍过，Ruby 支持模块（module）功能，打包一系列函数，在不同的地方引入。我们会利用模块来打包用户身份验证相关的函数。我们当然可以创建一个新的模块，不过 Sessions 控制器已经提供了一个名为 `SessionsHelper` 的模块，而且这个模块中的帮助方法会自动引入 Rails 程序的视图中。所以，我们就直接使用这个现成的模块，然后在 Application 控制器中引入，如代码 8.14 所示。

**代码 8.14** 在 Application 控制器中引入 Sessions 控制器的帮助方法模块<br />`app/controllers/application_controller.rb`

{% highlight ruby %}
class ApplicationController < ActionController::Base
  protect_from_forgery
  include SessionsHelper
end
{% endhighlight %}

默认情况下帮助函数只可以在视图中使用，不能在控制器中使用，而我们需要同时在控制器和视图中使用帮助函数，所以我们就手动引入帮助函数所在的模块。

因为 HTTP 是无状态的协议，所以如果应用程序需要实现登录功能的话，就要找到一种方法记住用户的状态。维持用户登录状态的方法之一，是使用常规的 Rails session（通过 `session` 函数），把用户的 id 保存在“记忆权标（remember token）”中：

{% highlight ruby %}
session[:remember_token] = user.id
{% endhighlight %}

`session` 对象把用户 id 存在浏览器的 cookie 中，这样网站的所有页面就都可以获取到了。浏览器关闭后，cookie 也随之失效。在网站中的任何页面，只需调用 `User.find(session[:remember_token])` 就可以取回用户对象了。Rails 在处理 session 时，会确保安全性。倘若用户企图伪造用户 id，Rails 可以通过每个 session 的 session id 检测到。

根据示例程序的设计目标，我们计划要实现的是持久保存的 session，也就是即使浏览器关闭了，登录状态依旧存在，所以，登入的用户要有一个持久保存的标识符才行。为此，我们要为每个用户生成一个唯一而安全的记忆权标，长期存储，不会随着浏览器的关闭而消失。

记忆权标要附属到特定的用户对象上，而且要保存起来以待后用，所以我们就可以把它设为 User 模型的属性（如图 8.8）。我们先来编写 User 模型的测试，如代码 8.15 所示。

![user_model_remember_token_31](assets/images/figures/user_model_remember_token_31.png)

图 8.8：User 模型，添加了 `remember_token` 属性

**代码 8.15** 记忆权标的第一个测试<br />`spec/models/user_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe User do
  .
  .
  .
  it { should respond_to(:password_confirmation) }
  it { should respond_to(:remember_token) }
  it { should respond_to(:authenticate) }
  .
  .
  .
end
{% endhighlight %}

要让这个测试通过，我们要生成记忆权标属性，执行如下命令：

{% highlight sh %}
$ rails generate migration add_remember_token_to_users
{% endhighlight %}

然后按照代码 8.16 修改生成的迁移文件。注意，因为我们要使用记忆权标取回用户，所以我们为 `remember_token` 列加了索引（参见 [旁注 6.2](chapter6.html#box-6-2)）。

**代码 8.16** 为 `users` 表添加 `remember_token` 列的迁移<br />`db/migrate/[timestamp]_add_remember_token_to_users.rb`

{% highlight ruby %}
class AddRememberTokenToUsers < ActiveRecord::Migration
  def change
    add_column :users, :remember_token, :string
    add_index :users, :remember_token
  end
end
{% endhighlight %}

然后，还要更新开发数据据和测试数据库：

{% highlight sh %}
$ bundle exec rake db:migrate
$ bundle exec rake db:test:prepare
{% endhighlight %}

现在，User 模型的测试应该可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/models/user spec.rb
{% endhighlight %}

接下来我们要考虑记忆权标要保存什么数据，这有很多种选择，其实任何足够长的随机字符串都是可以的。因为用户的密码是经过加密处理的，所以原则上我们可以直接把用户的 `password_hash` 值拿来用，不过这样做可能会向潜在的攻击者暴露用户的密码。以防万一，我们还是用 Ruby 标准库中 `SecureRandom` 模块提供的 `urlsafe_base64` 方法来生成随机字符串吧。`urlsafe_base64` 方法生成的是 Base64 字符串，可以放心的在 URI 中使用（因此也可以放心的在 cookie 中使用）。<sup>[3](#fn-3)</sup>写作本书时，`SecureRandom.urlsafe_base64` 创建的字符串长度为 16，由 A-Z、a-z、0-9、下划线（_）和连字符（-）组成，每一位字符都有 64 中可能的情况，所以两个记忆权标相等的概率就是 1/64<sup>16</sup>=2<sup>-96</sup>≈10<sup>-29</sup>，完全可以忽略。

我们会使用回调函数来创建记忆权标，回调函数在 [6.2.5 节](chapter6.html#sec-6-2-5) 中实现 Email 属性的唯一性验证时介绍过。和 [6.2.5 节](chapter6.html#sec-6-2-5) 中的用法一样，我们还是要使用 `before_save` 回调函数，在保存用户之前创建 `remember_token` 的值。<sup>[4](#fn)</sup>要测试这个过程，我们可以先保存测试用用户对象，然后检查 `remember_token` 是否为非空。这样做，如果以后需要改变记忆权标的生成方式，就无需再修改这个测试了。测试代码如代码 8.17 所示。

**代码 8.17** 测试合法的（非空）记忆权标值<br />`spec/models/user_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe User do

  before do
    @user = User.new(name: "Example User", email: "user@example.com",
                   password: "foobar", password_confirmation: "foobar")
  end

  subject { @user }
  .
  .
  .
  describe "remember token" do
    before { @user.save }
    its(:remember_token) { should_not be_blank }
  end
end
{% endhighlight %}

代码 8.17 中用到了 `its` 方法，它和 `it` 很像，不过测试对象是参数中指定的属性而不是整个测试的对象。也就是说，如下的代码：

{% highlight ruby %}
its(:remember_token) { should_not be_blank }
{% endhighlight %}

等同于

{% highlight ruby %}
it { @user.remember_token.should_not be_blank }
{% endhighlight %}

程序所需的代码会涉及到一些新的知识。其一，我们添加了一个回调函数来生成记忆权标：

{% highlight ruby %}
before save :create_remember_token
{% endhighlight %}

当 Rails 执行到这行代码时，会寻找一个名为 `create_remember_token` 的方法，然后在保存用户之前执行这个方法。其二，`create_remember_token` 只会在 User 模型内部使用，所以就没必要把它开放给用户之外的对象了。在 Ruby 中，我们可以使用 `private` 关键字（译者注：其实 `private` 是方法而不是关键字，请参阅《Ruby 编程语言》P233）限制方法的可见性：

{% highlight ruby %}
pivate

  def create_remember_token
    # Create the token.
  end
{% endhighlight %}

在类中，`private` 之后定义的方法都会被设为私有方法，所以，如果执行下面的操作

{% highlight sh %}
$ rails console
>> User.first.create_remember_token
{% endhighlight %}

就会抛出 `NoMethodError` 异常。

其三，在 `create_remember_token` 方法中，要给用户的属性赋值，需要在 `remember_token` 前加上 `self` 关键字：

{% highlight ruby %}
def create_remember_token
  self.remember_token = SecureRandom.urlsafe_base64
end
{% endhighlight %}

（提示：如果你使用的是 Ruby 1.8.7，就要把 `SecureRandom.urlsafe_base64` 换成 `SecureRandom_hex`。）

Active Record 是把模型的属性和数据库表中的列对应的，如果不指定 `self` 的话，我们就只是创建了一个名为 `remember_token` 的局部变量而已，这可不是我们期望得到的结果。加上 `self` 之后，赋值操作就会把值赋值给用户的 `remember_token` 属性，保存用户时，随着其他的属性一起存入数据库。

把上述的分析结合起来，最终得到的 User 模型文件如代码 8.18 所示。

**代码 8.18** 生成记忆权标的 `before_save` 回调函数<br />` app/models/user.rb`

{% highlight ruby %}
class User < ActiveRecord::Base
  attr_accessible :name, :email, :password, :password_confirmation
  has_secure_password

  before_save { |user| user.email = email.downcase }
  before_save :create_remember_token
  .
  .
  .
  private

    def create_remember_token
      self.remember_token = SecureRandom.urlsafe_base64
    end
{% endhighlight %}

顺便说一下，我们为 `create_remember_token` 方法增加了一层缩进，这样可以更好的突出这些方法是在 `private` 之后定义的。

译者注：如果按照 bbatsov 的《[Ruby 编程风格指南](https://github.com/bbatsov/ruby-style-guide)》（[中译版]( https://github.com/ruby-china/ruby-style-guide/blob/master/README-zhCN.md)）来编写 Ruby 代码的话，就没必要多加一层缩进。

因为 `SecureRandom.urlsafe_base64` 方法创建的字符串不可能为空值，所以对 User 模型的测试现在应该可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/models/user_spec.rb
{% endhighlight %}

<h3 id="sec-8-2-2">8.2.2 定义 <code>sign_in</code> 方法</h3>

本小节我们要开始实现登录功能了，首先来定义 `sign_in` 方法。上一小节已经说明了，我们计划实现的身份验证方式是，在用户的浏览器中存储记忆权标，在网站的页面与页面之间通过这个记忆权标获取数据库中的用户记录（会在 [8.2.3 节](#sec-8-2-3)]实现）。实现这一设想所需的代码如代码 8.19 所示，这段代码使用了两个新内容：`cookies` Hash 和 `current_user` 方法。

**代码 8.19** 完整但还不能正常使用的 `sign_in` 方法<br />`app/helpers/sessions_helper.rb`

{% highlight ruby %}
module SessionsHelper
  def sign_in(user)
    cookies.permanent[:remember_token] = user.remember_token
    self.current_user = user
  end
end
{% endhighlight %}

上述代码中用到的 `coockies` 是由 Rails 提供的，我们可以把它看成 Hash，其中每个元素又都是一个 Hash，包含两个元素，`value` 指定 cookie 的文本，`expires` 指定 cookie 的失效日期。例如，我们可以使用下述代码实现登录功能，把 cookie 的值设为用户的记忆权标，失效日期设为 20 年之后：

{% highlight ruby %}
cookies[:remember token] = { value: user.remember_token,
                             expires: 20.years.from_now.utc }
{% endhighlight %}

（这里使用了 Rails 提供的时间帮助方法，详情参见[旁注 8.1](#box-8-1)。）

<div id="box-8-1" class="aside">
  <h4>旁注 8.1 cookie 在 <code>20.years.from_now</code> 之后失效</h4>
  <p>在 <a href="chapter4.html#sec-4-4-2">4.4.2 节</a>中介绍过，你可以向任何的 Ruby 类，甚至是内置的类中添加自定义的方法，我们就向 <code>String</code> 类添加了 <code>palindrome?</code> 方法（而且还发现了 <code>"deified"</code> 是回文）。我们还介绍过，Rails 为 <code>Object</code> 类添加了 <code>blank?</code> 方法（所以，<code>"".blank?</code>、<code>" ".blank?</code> 和 <code>nil.blank?</code> 的返回值都是 <code>true</code>）。代码 8.19 中处理 cookie 的代码又是一例，使用了 Rails 提供的时间帮助方法，这些方法是添加到 `Fixnum` 类（数字的基类）中的。</p>
  <pre>
  $ rails console
  >> 1.year.from_now
  => Sun, 13 Mar 2011 03:38:55 UTC +00:00
  >> 10.weeks.ago
  => Sat, 02 Jan 2010 03:39:14 UTC +00:00
  </pre>
  <p>Rails 还添加了其他的帮助函数，如：</p>
  <pre>
  >> 1.kilobyte
  => 1024
  >> 5.megabytes
  => 5242880
  </pre>
  <p>这几个帮助函数可用于限制上传文件的大小，例如，图片最大不超过 <code>5.megabytes</code>。</p>
  <p>这种为内置类添加方法的特性很灵便，可以扩展 Ruby 的功能，不过使用时要小心一些。其实 Rails 的很多优雅之处正式基于 Ruby 语言的这一特性。</p>
</div>

因为开发者经常要把 cookie 的失效日期设为 20 年后，所以 Rails 特别提供了 `permanent` 方法，前面处理 cookie 的代码可以改写成：

{% highlight ruby %}
cookies.permanent[:remember_token] = user.remember_token
{% endhighlight %}

Rails 的 `permanent` 方法会自动把 cookie 的失效日期设为 20 年后。

设定了 cookie 之后，在网页中我们就可以使用下面的代码取回用户：

{% highlight ruby %}
User.find_by_remember_token(cookies[:remember_token])
{% endhighlight %}

其实浏览器中保存的 cookie 并不是 Hash，赋值给 `cookies` 只是把值以文本的形式保存在浏览器中。这正体现了 Rails 的智能，无需关心具体的处理细节，专注地实现应用程序的功能。

你可能听说过，存储在用户浏览器中的验证 cookie 在和服务器通讯时可能会导致程序被会话劫持，攻击者只需复制记忆权标就可以伪造成相应的用户登录网站了。Firesheep 这个 Firefox 扩展可以查看会话劫持，你会发现很多著名的大网站（包括 Facebook 和 Twitter）都存在这种漏洞。避免这个漏洞的方法就是整站开启 SSL，详情参见 [7.4.4 节](chapter7.html#sec-7-4-4)。

<h3 id="sec-8-2-3">8.2.3 获取当前用户</h3>

上一小节已经介绍了如何在 cookie 中存储记忆权标以待后用，这一小节我们要看一下如何取回用户。我们先回顾一下 `sign_in` 方法：

{% highlight ruby %}
module SessionsHelper

  def sign_in(user)
    cookies.permanent[:remember_token] = user.remember_token
    self.current_user = user
  end
end
{% endhighlight %}

现在我们关注的是方法定义体中的第二行代码：

{% highlight ruby %}
self.current_user = user
{% endhighlight %}

这行代码创建了 `current_user` 方法，可以在控制器和视图中使用，所以你既可以这样用：

{% highlight ruby %}
<%= current_user.name %>
{% endhighlight %}

也可以这样用：

{% highlight ruby %}
redirect_to current_user
{% endhighlight %}

这行代码中的 `self` 也是必须的，原因在分析代码 8.18 时已经说过，如果没有 `self`，Ruby 只是定义了一个名为 `current_user` 的局部变量。

在开始编写 `current_user` 方法的代码之前，请仔细看这行代码：

{% highlight ruby %}
self.current_user = user
{% endhighlight %}

这是一个赋值操作，我们必须先定义相应的方法才能这么用。Ruby 为这种赋值操作提供了一种特别的定义方式，如代码 8.20 所示。

**代码 8.20** 实现 `current_user` 方法对应的赋值操作<br />`app/helpers/sessions_helper.rb`

{% highlight ruby %}
module SessionsHelper

  def sign_in(user)
    .
    .
    .
  end

  def current_user=(user)
    @current_user = user
  end
end
{% endhighlight %}

这段代码看起来很奇怪，因为大多数的编程语言并不允许在方法名中使用等号。其实这段代码定义的 `current_user=` 方法是用来处理 `current_user` 赋值操作的。也就是说，如下的代码

{% highlight ruby %}
self.current_user = ...
{% endhighlight %}

会自动转换成下面这种形式

{% highlight ruby %}
current_user=(...)
{% endhighlight %}

就是直接调用 `current_user=` 方法，接受的参数是赋值语句右侧的值，本例中是要登录的用户对象。`current_user=` 方法定义体内只有一行代码，即设定实例变量 `@current_user` 的值，以备后用。

在常见的 Ruby 代码中，我们还会定义 `current_user` 方法，用来读取 `@current_user` 的值，如代码 8.21 所示。

**代码 8.21** 尝试定义 `current_user` 方法，不过我们不会使用这种方式

{% highlight ruby %}
module SessionsHelper

  def sign_in(user)
    .
    .
    .
  end

  def current_user=(user)
    @current_user = user
  end

  def current_user
    @current_user # Useless! Don't use this line.
  end
end
{% endhighlight %}

上面的做法其实就是实现了 `attr_accessor` 方法的功能（[4.4.5 节](chapter4.html#sec-4-4-5)介绍过）。<sup>[5](#fn-5)</sup>如果按照代码 8.21 来定义 `current_user` 方法，会出现一个问题：程序不会记住用户的登录状态。一旦用户转到其他的页面，session 就失效了，会自动登出用户。若要避免这个问题，我们要使用代码 8.19 中生成的记忆权标查找用户，如代码 8.22 所示。

**代码 8.22** 通过记忆权标查找当前用户<br />`app/helpers/sessions_helper.rb`

{% highlight ruby %}
module SessionsHelper
  .
  .
  .
  def current_user=(user)
    @current_user = user
  end

  def current_user
    @current_user ||= User.find_by_remember_token(cookies[:remember_token])
  end
end
{% endhighlight %}

代码 8.22 中使用了一个常见但不是很容易理解的 `||=`（“or equals”）操作符（[旁注 8.2](#box-8-2)中有详细介绍）。使用这个操作符之后，当且仅当 `@current_user` 未定义时才会把通过记忆权标获取的用户赋值给实例变量 `@current_user`。<sup>[6](#fn-6)</sup>也就是说，如下的代码

{% highlight ruby %}
@current_user ||= User.find_by_remember_token(cookies[:remember_token])
{% endhighlight %}

只在第一次调用 `current_user` 方法时调用 `find_by_remember_token` 方法，如果后续再调用的话就直接返回 `@current_user` 的值，而不必再查询数据库。<sup>[7](#fn-7)</sup>这种方式的优点只有当在一个请求中多次调用 `current_user` 方法时才能显现。不管怎样，只要用户访问了相应的页面，`find_by_remember_token` 方法都至少会执行一次。

<div id="box-8-2" class="aside">
  <h4>旁注 8.2 <code>||=</code> 操作符简介</h4>
  <p><code>||=</code> 操作符非常能够体现 Ruby 的特性，如果你打算长期进行 Ruby 编程的话就要好好学习它的用法。初学时会觉得 <code>||=</code> 很神秘，不过通过和其他操作符类比之后，你会发现也不是很难理解。</p>
  <p>我们先来看一下改变已经定义的变量时经常使用的结构。在很多程序中都会把变量自增一，如下所示</p>
  <pre>
  x = x + 1
  </pre>
  <p>大多数语言都为这种操作提供了简化的操作符，在 Ruby 中，可以按照下面的方式重写（C、C++、Perl、Python、Java 等也如此）：</p>
  <pre>
  x += 1
  </pre>
  <p>其他操作符也有类似的简化形式：</p>
  <pre>
  $ rails console
  >> x = 1
  => 1
  >> x += 1
  => 2
  >> x *= 3
  => 6
  >> x -= 7
  => -1
  </pre>
  <p>上面的举例可以概括为，<code>x = x O y</code> 和 <code>x O=y</code> 是等效的，其中 <code>O</code> 表示操作符。</p>
  <p>在 Ruby 中还经常会遇到这种情况，如果变量的值为 `nil` 则赋予其他的值，否则就不改变这个变量的值。[4.2.3 节](chapter4.html#sec-4-2-3) 中介绍过 <code>||</code> 或操作符，所以这种情况可以用如下的代码表示：</p>
  <pre>
  >> @user
  => nil
  >> @user = @user || "the user"
  => "the user"
  >> @user = @user || "another user"
  => "the user"
  </pre>
  <p>因为 <code>nil</code> 表示的布尔值是 <code>false</code>，所以第一个赋值操作等同于 <code>nil || "the user"</code>，这个语句的计算结果是 <code>"the user"</code>；类似的，第二个赋值操作等同于 <code>"the user" || "another user"</code>，这个语句的计算结果还是 <code>"the user"</code>，因为 <code>"the user"</code> 表示的布尔值是 <code>true</code>，这个或操作在执行了第一个表达式之后就终止了。（或操作的执行顺序是从左至右，只要出现真值就会终止语句的执行，这种方式称作“短路计算（short-circuit evaluation）”。）</p>
  <p>和上面的控制台会话对比之后，我们可以发现 <code>@user = @user || value</code> 符合 <code>x = x O y</code> 的形式，只需把 <code>O</code> 换成 <code>||</code>，所以就得到了下面这种简写形式：</p>
  <pre>
  >> @user ||= "the user"
  => "the user"
  </pre>
  <p>不难理解吧！</p>
  <p>**译者注：**这里对 <code>||=</code> 的分析和 Peter Cooper 的分析有点差异，我推荐你看以下 Ruby Inside 中的《<a href="http://www.rubyinside.com/what-rubys-double-pipe-or-equals-really-does-5488.html">What Ruby’s ||= (Double Pipe / Or Equals) Really Does</a>》一文。</p>
</div>

<h3 id="sec-8-2-4">8.2.4 </h3>
