---
layout: chapter
title: 第九章 更新、显示和删除用户
---

本章我们要完成[表格 7.1](chapter7.html#table-7-1)所示的用户资源，添加 `edit`、`update`、`index` 和 `destroy` 动作。首先我们要实现更新用户个人资料的功能，实现这样的功能自然要依靠安全验证系统（基于[第八章](chapter8.html)中实现的权限限制））。然后要创建一个页面列出所有的用户（也需要权限限制），期间会介绍样本数据和分页功能。最后，我们还要实现删除用户的功能，从数据库中删除用户记录。我们不会为所有用户都提供这种强大的权限，而是会创建管理员，授权他们来删除用户。


在开始之前，我们要新建 `updating-users` 分支：

{% highlight sh %}
$ git checkout -b updating-users
{% endhighlight %}

<h2 id="sec-9-1">9.1 更新用户</h2>

编辑用户信息的方法和创建新用户差不多（参见[第七章](chapter7.html)），创建新用户的页面是在 `new` 动作中处理的，而编辑用户的页面则是在 `edit` 动作中；创建用户的过程是在 `create` 动作中处理了 `POST` 请求，而编辑用户要在 `update` 动作中处理 `PUT` 请求（HTTP 请求参见[旁注 3.2](chapter3.html#sec-3-2)）。二者之间最大的区别是，任何人都可以注册，但只有当前用户才能更新他自己的信息。所以我们就要限制访问，只有授权的用户才能编辑更新资料，我们可以利用[第八章](chapter8.html)实现的身份验证机制，使用 before filter 实现访问限制。

<h3 id="sec-9-1-1">9.1.1 编辑表单</h3>

我们先来创建编辑表单，其构思图如图 9.1 所示。<sup>[1](#fn-1)</sup>和之前一样，我们要先编写测试。注意构思图中修改 Gravatar 头像的链接，如果你浏览过 Gravatar 的网站，可能就知道上传和编辑头衔的地址是 http://gravatar.com/emails，我们就来测试编辑页面中有没有一个链接指向了这个地址。<sup>[2](#fn-2)</sup>

![edit_user_mockup_bootstrap](assets/images/figures/edit_user_mockup_bootstrap.png)

图 9.1：编辑用户页面的构思图

对编辑用户表单的测试和第七章练习中的代码 7.31 类似，同样也测试了提交不合法数据后是否会显示错误提示信息，如代码 9.1 所示。

**代码 9.1** 用户编辑页面的测试<br />`spec/requests/user_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "User pages" do
  .
  .
  .
  describe "edit" do
    let(:user) { FactoryGirl.create(:user) }
    before { visit edit_user_path(user) }

    describe "page" do
      it { should have_selector('h1', text: "Update your profile") }
      it { should have_selector('title', text: "Edit user") }
      it { should have_link('change', href: 'http://gravatar.com/emails') }
    end

    describe "with invalid information" do
      before { click_button "Save changes" }
      it { should have_content('error') }
    end
  end
end
{% endhighlight %}

程序所需的代码要放在 `edit` 动作中，我们在[表格 7.1](chapter7.html#table-7-1)中列出了，用户编辑页面的地址是 /users/1/edit（假设用户的 id 是 1）。我们介绍过用户的 id 是保存在 `params[:id]` 中的，所以我们可以按照代码 9.2 所示的方法查找用户。

**代码 9.2** Users 控制器的 `edit` 方法<br />`app/controllers/users_controller.rb`

{% highlight ruby %}
class UsersController < ApplicationController
  .
  .
  .
  def edit
    @user = User.find(params[:id])
  end
end
{% endhighlight %}

要让测试通过，我们就要编写编辑用户页面的视图，如代码 9.3 所示。仔细观察一下视图代码，它和代码 7.17 中创建新用户页面的视图代码很相似，这就暗示我们要进行重构，把重复的代码移入局部视图了。重构的过程会留作练习，详情参见 [9.6 节](#sec-9-6)。

**代码 9.6** 编辑用户页面的视图<br />`app/views/users/edit.html.erb`

{% highlight erb %}
<% provide(:title, "Edit user") %>
<h1>Update your profile</h1>

<div class="row">
  <div class="span6 offset3">
    <%= form_for(@user) do |f| %>
      <%= render 'shared/error_messages' %>

      <%= f.label :name %>
      <%= f.text_field :name %>

      <%= f.label :email %>
      <%= f.text_field :email %>

      <%= f.label :password %>
      <%= f.password_field :password %>

      <%= f.label :password_confirmation, "Confirm Password" %>
      <%= f.password_field :password confirmation %>

      <%= f.submit "Save changes", class: "btn btn-large btn-primary" %>
    <% end %>

    <%= gravatar_for @user %>
    <a href="http://gravatar.com/emails">change</a>
  </div>
</div>
{% endhighlight %}

在这段代码中我们再次使用了 [7.3.2 节](chapter7.html#sec-7-3-2)中创建的 `error_messages` 局部视图。

添加了视图代码，再加上代码 9.2 中定义的 `@user` 变量，代码 9.1 中的测试应该就可以通过了：

{% highlight sh %}
$ bundle exec rspec spec/requests/user_pages_spec.rb -e "edit page"
{% endhighlight %}

编辑用户页面如图 9.2 所示，我们看到 Rails 会自动读取 `@user` 变量，预先填好了名字和 Email 地址字段。

![edit_page_bootstrap](assets/images/figures/edit_page_bootstrap.png)

图 9.2：编辑用户页面，名字和 Email 地址字段已经自动填好了

查看一下编辑用户页面的源码，我们可以发现的确生成了一个 `form` 元素，参见代码 9.4。

**代码 9.4** 编辑表单的 HTML

{% highlight html %}
<form action="/users/1" class="edit_user" id="edit_user_1" method="post">
    <input name="_method" type="hidden" value="put" />
    .
    .
    .
</form>
{% endhighlight %}

留意一下其中的一个隐藏字段：

{% highlight html %}
<input name="_method" type="hidden" value="put" />
{% endhighlight %}

因为浏览器本身并不支持发送 `PUT` 请求（[表格 7.1](chapter7.html#table-7-1)中列出的 REST 结构要用），所以 Rails 就在 `POST` 请求中使用这个隐藏字段伪造了一个 `PUT` 请求。<sup>[3](#fn-3)</sup>

还有一个细节需要注意一下，代码 9.3 和代码 7.17 都使用了相同的 `form_for(@user)` 来构建表单，那么 Rails 是怎么知道创建新用户要发送 `POST` 请求，而编辑用户时要发送 `PUT` 请求的呢？这个问题的答案是，通过 Active Record 提供的 `new_record?` 方法可以检测用户是新创建的还是已经存在于数据库中的：

{% highlight sh %}
$ rails console
>> User.new.new_record?
=> true
>> User.first.new_record?
=> false
{% endhighlight %}

所以在使用 `form_for(@user)` 构建表单时，如果 `@user.new_record?` 返回 `true` 则发送 `POST` 请求，否则就发送 `PUT` 请求。

最后，我们还要在导航中添加一个指向编辑用户页面的链接（“设置（Settings）”）。因为只有登录之后才会显示这个用户，所以对“设置”链接的测试要和其他的身份验证测试放在一起，如代码 9.5 所示。（如果能再测试一下没登录时不会显示“设置”链接就更完美了，这会留作练习，参见 [9.6 节](#sec-9-6)。）

**代码 9.5** 添加检测“设置”链接的测试<br />`spec/requests/authentication_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "Authentication" do
    .
    .
    .
    describe "with valid information" do
      let(:user) { FactoryGirl.create(:user) }
      before { sign_in user }

      it { should have_selector('title', text: user.name) }
      it { should have_link('Profile', href: user_path(user)) }
      it { should have_link('Settings', href: edit_user_path(user)) }
      it { should have_link('Sign out', href: signout_path) }
      it { should_not have_link('Sign in', href: signin_path) }
      .
      .
      .
    end
  end
end
{% endhighlight %}

为了简化，代码 9.5 中使用 `sing_in` 帮助方法，这个方法的作用是访问登录页面，提交合法的表单数据，如代码 9.6 所示。

**代码 9.6** 用户登录帮助方法<br />`spec/support/utilities.rb`

{% highlight ruby %}
.
.
.
def sign_in(user)
  visit signin_path
  fill_in "Email", with: user.email
  fill_in "Password", with: user.password
  click_button "Sign in"
  # Sign in when not using Capybara as well.
  cookies[:remember_token] = user.remember_token
end
{% endhighlight %}

如上述代码中的注释所说，如果没有使用 Capybara 的话，填写表单的操作是无效的，所以我们就添加了一行，在不使用 Capybara 时把用户的记忆权标添加到 cookies 中：

{% highlight ruby %}
# Sign in when not using Capybara as well.
cookies[:remember_token] = user.remember_token
{% endhighlight %}

如果直接使用 HTTP 请求方法就必须要有上面这行代码，具体的用法在代码 9.47 中有介绍。（注意，测试中使用的 `cookies` 对象和真实的 cookies 对象是有点不一样的，代码 8.19 中使用的 `cookies.permanent` 方法不能在测试中使用。）你可能已经猜到了，`sing_in` 在后续的测试中还会用到，而且还可以用来去除重复代码（参见 [9.6 节](#sec-9-6)）。

在程序中添加“设置”链接很简单，我们就直接使用[表格 7.1](chapter7.html#table-7-1) 中列出的 `edit_user_path` 具名路由，其参数设为代码 8.22 中定义的 `current_user` 帮助方法：

{% highlight erb %}
<%= link_to "Settings", edit_user_path(current_user) %>
{% endhighlight %}

完整的代码如代码 9.7 所示。

**代码 9.7** 添加“设置”链接<br />`app/views/layouts/_header.html.erb`

{% highlight erb %}
<header class="navbar navbar-fixed-top">
  <div class="navbar-inner">
    <div class="container">
      <%= link_to "sample app", root_path, id: "logo" %>
      <nav>
        <ul class="nav pull-right">
          <li><%= link_to "Home", root_path %></li>
          <li><%= link_to "Help", help_path %></li>
          <% if signed_in? %>
            <li><%= link_to "Users", '#' %></li>
            <li id="fat-menu" class="dropdown">
              <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                Account <b class="caret"></b>
              </a>
              <ul class="dropdown-menu">
                <li><%= link_to "Profile", current_user %></li>
                <li><%= link_to "Settings", edit_user_path(current_user) %></li>
                <li class="divider"></li>
                <li>
                  <%= link_to "Sign out", signout_path, method: "delete" %>
                </li>
              </ul>
            </li>
          <% else %>
            <li><%= link_to "Sign in", signin_path %></li>
          <% end %>
        </ul>
      </nav>
    </div>
  </div>
</header>
{% endhighlight %}

<h3 id="sec-9-1-2">9.1.2 编辑失败</h3>

本小节我们要处理编辑失败的情况，让代码 9.1 中对错误提示信息的测试通过。我们要在 Users 控制的 `update` 动作中使用 `update_attributes` 方法，传入提交的 `params` Hash，更新用户记录，如代码 9.8 所示。如果提交了不合法的数据，更新操作会返回 `false`，交由 `else` 分支处理，重新渲染编辑用户页面。我们之前用过类似的处理方式，代码结构和第一个版本的 `create` 动作类似（参见代码 7.21）。

**代码 9.8** 还不完整的 `update` 动作<br />`app/controllers/users_controller.rb`

{% highlight ruby %}
class UsersController < ApplicationController
  .
  .
  .
  def edit
    @user = User.find(params[:id])
  end

  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      # Handle a successful update.
    else
      render 'edit'
    end
  end
end
{% endhighlight %}

提交不合法信息后显示了错误提示信息（如图 9.3），测试就可以通过了，你可以运行测试组件验证一下：

{% highlight sh %}
$ bundle exec rspec spec/
{% endhighlight %}

![edit_with_invalid_information_bootstrap](assets/images/figures/edit_with_invalid_information_bootstrap.png)

图 9.3：提交编辑表单后显示的错误提示信息

<h3 id="sec-9-1-3">9.1.3 编辑成功</h3>

现在我们要让编辑表单能够正常使用了。编辑头像的功能已经实现了，因为我们把上传头像的操作交由 Gravatar 处理了，如需更换头像，点击图 9.2 中的“change”链接就可以了，如图 9.4 所示。下面我们来实现编辑其他信息的功能。

![gravatar_cropper](assets/images/figures/gravatar_cropper.png)

图 9.4：Gravatar 的剪切图片界面，上传了一个帅哥的图片

对 `update` 动作的测试和对 `create` 的测试类似。代码 9.9 介绍了如何使用 Capybara 在表单中填写合法的数据，还介绍了怎么测试提交表单的操作是否正确。测试的代码很多，你可以参考[第七章](chapter7.html)中的测试，试一下能不能完全理解。

**代码 9.9** 测试 Users 控制器的 `update` 动作<br />`spec/requests/user_pages_spec.rb`

{% highlight ruby %}
require 'spec_helper'

describe "User pages" do
  .
  .
  .
  describe "edit" do
    let(:user) { FactoryGirl.create(:user) }
    before { visit edit_user_path(user) }
    .
    .
    .
    describe "with valid information" do
      let(:new_name) { "New Name" }
      let(:new_email) { "new@example.com" }
      before do
        fill_in "Name",             with: new_name
        fill_in "Email",            with: new_email
        fill_in "Password",         with: user.password
        fill_in "Confirm Password", with: user.password
        click_button "Save changes"
      end

      it { should have_selector('title', text: new name) }
      it { should have_selector('div.alert.alert-success') }
      it { should have_link('Sign out', href: signout_path) }
      specify { user.reload.name.should == new_name }
      specify { user.reload.email.should == new_email }
    end
  end
end
{% endhighlight %}

上述代码中出现了一个新的方法 `reload`，出现在检测用户的属性是否已经更新的测试中：

{% highlight ruby %}
specify { user.reload.name.should == new_name }
specify { user.reload.email.should == new_email }
{% endhighlight %}

这两行代码使用 `user.reload` 从测试数据库中重新加载 `user` 的数据，然后检测用户的名字和 Email 地址是否更新成了新的值。

要让代码 9.9 中的测试通过，我们可以参照最终版本的 `create` 动作（代码 8.27）来编写 `update` 动作，如代码 9.10 所示。我们在代码 9.8  的基础上加入了下面这三行。

{% highlight ruby %}
flash[:success] = "Profile updated"
sign_in @user
redirect_to @user
{% endhighlight %}

注意，用户资料更新成功之后我们再次登入了用户，因为保存用户时，重设了记忆权标（代码 8.18），之前的 session 就失效了（代码 8.22）。这也是一项安全措施，因为如果用户更新了资料，任何会话劫持都会自动失效。

**代码 9.10** Users 控制器的 `update` 动作<br />`app/controllers/users_controller.rb`

{% highlight ruby %}
class UsersController < ApplicationController
  .
  .
  .
  def update
    @user = User.find(params[:id])
    if @user.update_attributes(params[:user])
      flash[:success] = "Profile updated"
      sign_in @user
      redirect_to @user
    else
      render 'edit'
    end
  end
end
{% endhighlight %}

注意，现在这种实现方式，每次更新数据都要提供密码（填写图 9.2 中那两个空的字段），虽然有点烦人，不过却保证了安全。

添加了本小节的代码之后，编辑用户页面应该可以正常使用了，你可以运行测试组件再确认一下，测试应该是可以通过的：

{% highlight sh %}
$ bundle exec rspec spec/
{% endhighlight %}

<h2 id="sec-9-2">9.2 权限限制</h2>

<div class="navigation">
  <a class="prev_page" href="chapter8.html">&laquo; 第八章 登录和退出</a>
  <a class="next_page" href="chapter10.html">第十章 &raquo;</a>
</div>

1. 图片来自 <http://www.flickr.com/photos/sashawolff/4598355045/>
2. Gravatar 会把这个地址转向 http://en.gravatar.com/emails，我去掉了前面的 en，这样选择其他语言的用户就会自动转向相应的页面了。
3. 不要担心实现的细节。具体的实现方式是 Rails 框架的开发者需要关注的，作为 Rails 程序开发者则无需关心。
