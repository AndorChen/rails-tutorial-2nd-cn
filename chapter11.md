---
layout: chapter
title: 第十一章 关注用户
---
在这一章中，我们会在现有的网站基础上增加社交功能( social layer )，允许用户关注( follow )其他人(或取消关注)，并在用户主页上显示其关注用户的最新微博( status feed )。我们同样会在用户页面上显示'我的关注'和'我的粉丝'。与此同时，我们将会在[11.1节](chapter11.html#sec-11-1))学习如何构建用户之间的数据库关系,随后在[11.2节](chapter11.html#sec-11-2))(包含一个对Ajax的简单介绍)学习构造网页界面。最后，我们会在[11.3节](chapter11.html#sec-11-3))实现一个完整的微博状态流( status feed )

在最后一章中会包括一些在本教程中最具有挑战的内容，为了实现状态流，我们会使用少量 Ruby/SQL 的小技巧。 通过这些例子，你将会了解 Rails 是如何处理更加复杂的数据模型，而这些知识会在你日后开发其他应用时发挥作用。 为了帮助你从教程学习到独立开发的过渡，在[11.4节](chapter11.html#sec-11-4)我们推荐了几个可以在已有微博核心基础上开发的额外功能，及一些高级资料的链接。

和之前章节一样，Git 用户应该创建一个新的分支

```
$ git checkout -b following-users
```

因为这章内容比较有挑战，我们在开始编写代码之前，首先来思考一下网站的界面( interface )。 在之前的章节中， 我们会通过设计原型( mockups )来呈现页面样式。<sup>[1](#fn-1)</sup> 完整的页面流程如下：一名用户 (John Calvin) 从他的个人信息页 ( 图 11.1 ) 跳转到用户页面 ( 图 11.2 ) 去关注一个用户。Calvin 下一步点开了第二名用户 Thomas Hobbes 的个人主页，( 图 11.3 )，点击“关注”键 关注该用户。 与此同时，“关注”按钮变为“取消关注” 并使Hobbes的关注人数加1 ( 图 11.4 )。接下来，Calvin回到自己的主页，他能看到关注人数加1，同时在微博流中能看到Hobbes的新状态 ( 图 11.5 )。接下来的整个章节将会带领您实现这样的页面流程。

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_profile_mockup_bootstrap.png)

图11.1 用户个人信息页

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_user_index_mockup_bootstrap.png)

图11.2 寻找一个用户来关注

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_other_profile_follow_button_mockup_bootstrap.png)

图11.3 一个想要关注的用户信息页，及关注按钮

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_other_profile_unfollow_button_mockup_bootstrap.png)

图11.4 关注按钮变为取消关注的同时，关注人数加1

![profile_mockup_profile_name_bootstrap](assets/images/figures/page_flow_home_page_feed_mockup_bootstrap.png)

图11.5 个人主页出现新关注用户的微博，关注人数加1

<h2 id="sec-11-1">11.1 关系模型</h2>

为了实现关注用户这一功能，第一步我们要做的是创建一个看上去并不是那么直观的数据模型。一开始我们可能会认为一个 `has_many` 的数据关系会满足我们的要求：一个用户可以关注多个用户，同时一个用户还会被多个用户关注。但实际上这个关系存在问题，接下来我们会学习如何正确使用 `has_many` 来解决这个问题。 在本章中，更加复杂的数据模型会让你发现很多东西并不是一上来就能理解，你需要花一点时间思考，来真正搞清楚这样做的原因。 如果你发现自己越发困惑，尝试先往后读，然后再回来读刚才困惑的部分，没准这样会更清楚一点。

<h3 id="sec-11-1-1">11.1.1 数据模型带来的问题(及解决方式) </h3>

作为构造数据模型的第一步，我们先来看一个典型的情况。考虑下述情况,一个用户关注了另外一名用户：比如 Calvin 关注了Hobbes，换句话说 Hobbes 被 Calvin 关注，所以 Calvin 是关注者( following )，而 Hobbes 则是被关注( followed )。 我们使用 Rails 默认的复数表示习惯， 我们称关注某一特定用户的用户集合为该特定用户的 followers，进而 `user.followers` 则成为一个关注用户组成的列表。 不幸的是，当我们颠倒一下顺序，上述关系则不成立了： 默认情况下，所有我们关注的用户称之为 followeds，这实际上在英语语法上并不是非常通顺恰当。虽然我们可以称他们为 following，但这有些歧义：在英语里，"following" 指关注你的人，和我们想表达的恰恰相反。考虑到上述两种情况，尽管我们将使用 "following" 作为页面显示时的标签，如 “50 following,75 followers”, 我们在数据模型上会使用 "followed users"来标记我们关注的用户集合，及一个对应的 `user.followed_users` 列表。<sup>[2](#fn-2)</sup>

经过上述的讨论，我们会按照( 图 11.6 )的方式来对 followed users 进行建模， 包含一个 `followed_users` 表及一个 `一对多( has_many )` 的关系。由于 `user.followed_users` 应该是一个用户列表( array of users ), `followed_user` 表中的每一行为一个用户，由 `followed_id` 标识，并与 `follower_id` 共同创建了关注用户和被关注用户之间的关系。<sup>[3](#fn-3)</sup> 除此以外，由于每一行为一个用户，我们还需要包括用户的其他属性，包括名字，密码等等。

![profile_mockup_profile_name_bootstrap](assets/images/figures/naive_user_has_many_followed_users.png)

图11.6 一个简单的用户互相关注实现

( 图 11.6 )描述的数据模型仍存在一个问题，那就是存在非常多的冗余：每一行不仅包括了每一个关注用户的 id, 也包括了他们的其他信息——而这些信息已经存在于 `users` 表中。 更糟糕的是，为了建立关注用户的数据模型，我们需要一个单独的，同样冗余的 `followers`表。 这将最终导致数据模型极其难以维护：假设每次当用户修改他的姓名，我们不仅需要该用户在 `users` 表中的数据项， 同时还要修改 `followed_users` 及 `followers` 表中的每一个对应项。

造成这个问题的主要原因是，我们缺少了一层抽象。 找到合适抽象的一个方法是，思考我们将如何在一个 web application 中实现关注用户操作。 回忆 [7.1.2节](chapter7.html#sec-7-1-2)中 REST 架构包括创建资源及删除资源。 这便促使我们提出两个问题： 当一个用户关注另外一名用户，有什么东西被创建， 当一个用户取消关注另外一名用户，又有什么东西被删除？

第一眼看上去， 我们觉得在上述两种情况下，applicaiton 应该创建或删除两个用户间的一个关系( **relationship** )。 在上述两种操作结束后，一个用户将会 `has_many :relationships`，并拥有很多 `followed_users (or followers)`。 在( 图 11.6 )中我们已经包括了绝大部分的实现： 由于每一个你关注的用户由 `followed_id` 独一无二的标识出来， 我们可以将 `followed_users` 转换为一个 `relationships` 数据表， 忽略用户的详细资料并使用 `followed_id` 来从 `users` 表中获得关注的用户数据。 同样的，通过颠倒( reverse )数据关系， 我们可以使用 `follower_id` 列来获得一个所有关注该用户的其他人组成的列表。

为了得到一个由所有关注用户组成的 `followed_users` 列表， 我们可以首先得到一个 `followed_id` 数据项组成的列表，并找到每一项对应的用户。 幸运的是，Rails 有一个方式能让这项工作变得非常方便， 我们称之为 `has_many through`。 我们将在[ 11.1.4节 ](chapter11.html#sec-11-1-4)了解到， Rails允许我们使用下面这行清晰简洁的代码，通过关系数据表( relationships table )来描述一个用户关注了很多其他用户

```
has many :followed users, through: :relationships, source: "followed id"
```

这行代码自动的获得 ``user.followed_users``，一个由关注用户组成的列表。 图11.7 描述了这个数据模型。

![profile_mockup_profile_name_bootstrap](assets/images/figures/user_has_many_followed_users.png)

图11.7 通过 user relationships 建立的关注用户数据模型

下面让我们动手实现， 首先我们通过创建一个关系模型

```
$ rails generate model Relationship follower_id:integer followed_id:integer
```

由于我们需通过 follower_id 及 followed_id 来查找关系， 我们需要为这两列数据加上索引， 如列表11.1所示。

```
class CreateRelationships < ActiveRecord::Migration 
	def change		create table :relationships do |t| 
			t.integer :follower id			t.integer :followed id			t.timestamps 
	end	
	add index :relationships, :follower id	add index :relationships, :followed id	add index :relationships, [:follower id, :followed id], unique: true	end 
end```
``列表11.1`` 同样设置了一个 index 来保证每一对 (``follower_id, followed_id``)也是唯一的， 这样用户就无法关注同一个用户多次 (可以和列表6.22中为保持 email 唯一的 index 做对比)：
```
￼add index :relationships, [:follower id, :followed id], unique: true```
在[ 11.1.4节 ](chapter11.html#sec-11-1-4)将会看到， 在我们的用户界面，我们采用另外的方式保证了不允许关注同一个用户多次，但在这里，当一个用户创建重复关系时，通过添加一个唯一的index，我们能够触发错误(例如，使用控制台工具如 curl )。 我们也可以为关系模型添加一个唯一校验， 但因为每次我们尝试创建一个重复关系时会触发错误，所以通过添加唯一的index足以满足我们的要求。
为了创建 ``relationships`` 数据表，我们迁移(migrate) 数据库，并和往常一样准备好测试数据库：
``
￼$ bundle exec rake db:migrate$ bundle exec rake db:test:prepare``
最后的数据模型关系如图11.8所示。
![profile_mockup_profile_name_bootstrap](assets/images/figures/relationship_model.png)

图11.8 relationship数据模型。

<h3 id="sec-11-1-2">11.1.2 User/Relationship 之间的关系 </h3>
在着手实现已关注用户 (followed users) 和关注者 (followers)之前， 我们首先需要建立 users 和 relationships 之间的关系。 一个user ``has_many`` relationships, 并且由于 relationships 包含了两个 users， 所以同一个relationship 会同时 ``belongs_to`` 已关注用户 (followed users) 和关注者 (followers)。

与[ 10.1.3节 ](chapter10.html#sec-10-1-3)微博类似，我们将通过关联用户来创建新的relationships， 如下所示
```
user.relationships.build(followed_id: ...)
```
首先，我们编写测试，如列表11.2所示， 我们声明一个 ``relationship`` 变量， 检查其是否 valid， 并保证 ``follower_id`` 无法访问 (如果检查可访问属性的测试通过，请检查你的 ``application.rb``已经参照列表10.6更新) 



```
require 'spec helper' describe Relationship do	let(:follower) { FactoryGirl.create(:user) }	let(:followed) { FactoryGirl.create(:user) }	let(:relationship) { follower.relationships.build(followed id: followed.id) }  
	subject { relationship }	it { should be_valid }	
	describe "accessible attributes" do		it "should not allow access to follower id" do
			expect do
				Relationship.new(follower id: follower.id)			end.should raise_error(ActiveModel::MassAssignmentSecurity::Error)		end 	endend
```
``列表11.2`` 测试 Relationship 创建及其属性
spec/models/relationship_spec.rb

这里需要注意， 与测试 User 和 Micropost 模型时使用``@user`` 和 ``@micropost``不同，列表11.2使用 ``let`` 替代实例变量 (instance variable )。 两者之间几乎没有差别[4](#fn-4), 但我认为使用 ``let`` 相对于使用实例变量更加清晰。 我们一开始测试 User 和 Micropost 时使用实例变量是希望读者早些接触这个重要的概念，而 ``let`` 则是略微高级的技巧，所以我们放在后面。

同时我们需要对一个 relationships 中的 User 数据模型进行测试，如列表11.3所示

```
require 'spec helper'describe User do .	.	.	it { should respond_to(:feed) }	it { should respond_to(:relationships) } .	.	.end
```
``列表11.3`` 测试``user.relationships``的属性。
``spec/models/user_spec.rb``
此时，你可能会期待类似于[ 10.1.3节 ](chapter10.html#sec-10-1-3) 的应用代码， 确实，两者非常相似， 除了一点关键的不同：对于Micropost 模型而言， 我们可以说
```
class Micropost < ActiveRecord::Base
	belongs_to :user
	.
	.
	.
end```
及
```
class User < ActiveRecord::Base
	has_many :microposts
	.
	.
	.
end```
因为 ``microposts`` 数据表有一个 ``user_id`` 属性来辨识每一个用户 ([ 10.1.1节 ](chapter10.html#sec-10-1-1))。这种链接两个数据表的id项，我们称之为外键(foreign key)，且当一个 User 模型的外键为 ``user_id`` 时，Rails会自动的获知两者之间的联系：默认情况下，Rails 期望外键形如 ``<class>_id`` ，其中 ``<class>`` 是类名的小写形式。[5](#fn-5) 对于现在的情况， 尽管我们仍在和 users 打交道， 但我们是通过外键 ``follower_id`` 来辨识他们， 所以我们需要告诉rails， 如列表11.4所示[6](#fn-6)。
```
class User < ActiveRecord::Base
	.
	.
	.
	has_many :microposts, dependent: :destroy
	has_many :relationships, foreign_key: "follower_id", dependent: :destroy
	.
	.
	.`````列表11.4`` 实现 user/relationships ``一对多``关系
``app/models/user.rb``

由于删除一个 user 同时也应该删除该 user 的 relationships， 于是我们加入了``dependent: :destroy``；我们把这个测试留作练习([ 11.5节 ](chapter11.html#sec-11-5))。

```
describe Relationship do .	.	.	describe "follower methods" do		it { should respond_to(:follower) } 
		it { should respond_to(:followed) } 
		its(:follower) { should == follower } 
		its(:followed) { should == followed }	end 
end
```
``列表11.5`` 测试 user/relationships ``belongs_to`` 关系。
``spec/models/relationship_spec.rb``

下面我们开始写 application 代码， 我们与往常一样定义``belongs_to`` 关系。 Rails会通过符号变量获知外键名字(例如 从``:follower``中获知 ``follower_id``， 和从``:followed`` 中获知 ``followed_id``)，但由于此时没有 Followed 或 Follower 模型， 我们需要提供提供 ``User`` 类的名字。 结果如列表11.6所示。 注意，与默认生成的 Relationship 模型不同， 此时只有``followed_id``可以访问。

```
class Relationship < ActiveRecord::Base
	attr_accessible :followed_id
	
	belongs_to :follower, class_name: "User"
	belongs_to :followed,class_name: "User"
end
```
``列表11.6`` 为 Relationship 模型添加``belongs_to``关系。
``spec/models/relationship_spec.rb``

尽管直到[ 11.1.5节 ](chapter11.html#sec-11-1-5)我们才会用到``followed``关系， 但同时实现 follower/followed 结构会更容易理解。

此时，列表11.2和列表11.3的测试应该可以通过了。

```
$ bundle exec rspec spec/
```

<h3 id="sec-11-1-3">11.1.3 校验</h3>
在结束这部分之前，我们将添加一些对 Relationship 模型的校验，保证其完整性。 测试 (列表11.7) 和 application 代码 (列表11.8)非常直接易懂。

```
describe Relationship do .	.	.	describe "when followed id is not present" do		before { relationship.followed id = nil }		it { should not be valid }	end	describe "when follower id is not present" do 
		before { relationship.follower id = nil } 
		it { should not be valid }	end 
end
```
``列表 11.7`` 测试 Relationship 模型校验
``spec/models/relationship_spec.rb``

```
class Relationship < ActiveRecord::Base 	attr accessible :followed id	belongs to :follower, class name: "User" 
	belongs to :followed, class name: "User"	validates :follower id, presence: true	validates :followed id, presence: true end
```
``列表 11.8`` 添加 Relationship 模型校验
``app/models/relationship.rb``

<h3 id="sec-11-1-4">11.1.4 关注用户</h3>
下面到了 Relationship 关系的核心部分： followed_users 及 followers。 我们首先从 followed_users 开始， 如列表 11.9所示。

```
require 'spec helper'describe User do .	.	.	it { should respond to(:relationships) } 
	it { should respond to(:followed users) } .	.	.end
```
``列表 11.9`` 测试 ``user.followed_users`` 属性
``spec/models/user_spec.rb``

这里的实现第一次使用了``has_many through``：一个用户拥有多个following ``through`` 关系， 如图 11.7所示。 默认情况下， 在一个 ``has_many through``关系中，Rails 会寻找对应于singular version的关系； 换句话说，像下面的代码
```
has_may :followeds, through: :relationships
``` 
会使用 ``relationships`` 表中的 ``followed_id`` 生成一个数组。 但是，正如 [ 11.1.1节 ](chapter11.html#sec-11-1-1) 提到的，``user.followeds ``名字比较蹩脚； 若我们使用 "followed users" 作为 “followed” 的复数形式会好得多， 并使用 ``user.followed_users`` 来表示关注用户的序列。 Rails允许我们重写默认设定, 对于这个例子，使用 ``:source`` 参数 (列表 11.10)来告诉 Rails ``followed_users``列表的 source 是 ``followed`` ids集合。

```
class User < ActiveRecord::Base .	.	.	has many :microposts, dependent: :destroy	has many :relationships, foreign key: "follower id", dependent: :destroy has 	many :followed users, through: :relationships, source: :followed	.	.	.end
```
``列表 11.10`` 添加 User 模型的 ``followed_users`` 关系
``app/models/user.rb``







