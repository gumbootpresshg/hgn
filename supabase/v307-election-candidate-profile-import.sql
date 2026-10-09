-- HGN v0.67.16 - Import candidate-submitted profiles from Issue 62, pages 7-13.

update public.hgn_election_candidate_profiles set portrait_url = '/candidate-profiles/' || photo
from (values
  ('jasmine-beachy-port-clements-councillor', 'jasmine-beachy.jpg'),
  ('amber-bellis-port-clements-councillor', 'amber-bellis.jpg'),
  ('brigid-cumming-port-clements-councillor', 'brigid-cumming.jpg'),
  ('dennis-reindl-port-clements-councillor', 'dennis-reindl.jpg'),
  ('betty-stewart-port-clements-councillor', 'betty-stewart.jpg')
) as portraits(slug, photo)
where hgn_election_candidate_profiles.slug = portraits.slug;

insert into public.hgn_election_candidate_profiles
  (slug, candidate_name, office, race_name, community, portrait_url, statement, source_label, sort_order)
values
('kris-olsen-daajing-giids-mayor', 'Kris Olsen', 'Candidate for Mayor', 'Daajing Giids municipal candidates', 'Daajing Giids', '/candidate-profiles/kris-olsen.jpg', $$My name is Kris Olsen, my Haida name is Dluujuu. I am proudly adopted into the Raven Clan of Skedans. I am very honoured and privileged to be able to run for the position of mayor again in the community of Daajing Giids.

I have spent three terms as a councillor and one term as Mayor, as well as working Gidgalang Kuuyas Naay Secondary School for the past 20 years. I believe a hard-working, healthy community supports all of its residents from the cradle throughout their life’s journey to the grave. To do this, we need to build respectful relations with the Council of Haida Nation, Band Councils, all Islands communities as we advocate regionally, provincially and federally for our community and Haida Gwaii.

My priorities this term are: #1 Waste Water Treatment #2 Housing #3 CT Scanner. Haawa, thank you and merci for the opportunity to be your Mayor.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 7', 10),
('bill-beamish-daajing-giids-councillor', 'Bill Beamish', 'Candidate for Councillor', 'Daajing Giids municipal candidates', 'Daajing Giids', '/candidate-profiles/bill-beamish.jpg', $$Objective: “Ensure that everyone has a voice in community development and decision making”

I have 35 years of experience working in local government administration and project management; and 4 years as the elected mayor of the Town of Gibsons. As the CAO for the VQC in 2010-2012, I assisted council to design and develop Spirit Square, the brick waterfront walkway and Bear Park.

Education: Diploma in Public Sector Management from UVIC and a Province of BC Certificate in LG Executive Management.

I am Married to Heather (40yrs), a Resident of Daajing Giids (4years) and a Volunteer director of the Housing Society and the Men’s Shed.

My priorities are to:
1. Complete the wastewater treatment plant.
2. Expand housing opportunities.
3. Maintain municipal infrastructure and public spaces.
4. Advocate for improved federal and provincial government services and the CT Scanner Project.
5. Work with other communities and the CHN.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 7', 20),
('kim-claggett-daajing-giids-councillor', 'Kim Claggett', 'Candidate for Councillor', 'Daajing Giids municipal candidates', 'Daajing Giids', '/candidate-profiles/kim-claggett.jpg', $$My goal in running for office is not because I want to be a politician, but because I want a chance to be involved, in an impactful way, in discussions about: housing; public transit; services for our youth and elders; the spending obligations of a town with a population of less than 1,000 people; and transparency.

In my previous life, I worked with street youth in Vancouver and served on the Board of the Downtown Eastside Raymur Housing Project.

I served 10 years on the Board of the Daajing Giids' Housing Societies, the last few as President. I trained in Mediation and Negotiation at the Justice Institute of BC, and have developed 2 successful local businesses. I currently run the Foodbank for south-end Haida Gwaii. I understand that public service is service, and I am prepared to take this obligation seriously. I believe that we have more in common than what separates us, and we are all in this together.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 7', 30),
('lisa-pineault-daajing-giids-councillor', 'Lisa Pineault', 'Candidate for Councillor', 'Daajing Giids municipal candidates', 'Daajing Giids', '/candidate-profiles/lisa-pineault.jpg', $$I bring practical problem-solving, fiscal responsibility, and a commitment to advocate for Daajing Giids, Haida Gwaii and the North. I ask for your vote. Our municipality would benefit from continuity in leadership.

As with the previous term as mayor, I remain committed to ensuring our municipality approaches Haida Title with curiosity, collaboration and respect. I will ensure DG continues to work collaboratively with the CHN and B.C. during implementation and beyond.

The Wastewater Treatment Facility is our most critical operational challenge. We must resolve our discharge of raw effluent into the inlet. This facility has been needed for the past 40 years.

Our term has benefited from a strategic approach to advocacy. Following success restoring the Northern Residents Deduction, we have started a Healthcare Equality Advocacy. Working with BC Policy Solutions, we are doing a pilot study to quantify costs accessing healthcare due to geographical service gaps.

Hawaa, thank you and merci.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 8', 40),
('jennifer-rutt-daajing-giids-councillor', 'Jennifer Rutt', 'Candidate for Councillor', 'Daajing Giids municipal candidates', 'Daajing Giids', '/candidate-profiles/jennifer-rutt.jpg', $$I am Jennifer Rutt, and after calling Daajing Giids home for 11 years, and proudly receiving my Canadian citizenship last year, I am running for Village Council to give back to the community that I have called home.

My commitment to Daajing Giids and Haida Gwaii is reflected in both service and leadership, from volunteering with the Gwaii Animal Helpline to previously serving as Executive Director of the Misty Isles Economic Development Society (MIEDS). Through my background in economic development, strategic partnerships, and grant lifecycle management, I bring a practical, disciplined approach to governance.

I am focused on delivering smart, forward-thinking solutions while containing village costs through responsible fiscal oversight and maximized external funding. As your councillor, I will work collaboratively to support local families, strengthen our infrastructure, and ensure our community remains affordable and thriving. I would be honoured to earn your vote.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 8', 50),
('hayl-zacks-daajing-giids-councillor', 'Hayl Zacks', 'Candidate for Councillor', 'Daajing Giids municipal candidates', 'Daajing Giids', '/candidate-profiles/hayl-zacks.jpg', $$My name is Hayl Zacks and I am running for Village of Daajing Giids Council. I first came to Haida Gwaii in January 2017 and visited every year until making Daajing Giids home in 2022. I am an Early Childhood Educator and Program Coordinator. I carry over a decade of experience in community advocacy and political organizing.

My platform is focused on housing, youth programming, intercommunity collaboration, climate adaptation and accessibility:

I am passionate about finding sustainable solutions to the housing crisis.
I am committed to increasing youth programming, supported and run by the Village.
I will represent our Village with respect and build meaningful intercommunity relationship across Haida Gwaii.
I will take a proactive approach to climate change and its effects on the lands and waters that sustain us.
I am committed to developing a more accessible public services and spaces.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 8', 60),
('alanah-mountifield-daajing-giids-councillor', 'Alanah Mountifield', 'Candidate for Councillor', 'Daajing Giids municipal candidates', 'Daajing Giids', null, $$This is to announce my candidacy for Councillor for the Village of Daajing Giids for the 2026-2030 term.

Our village faces both great opportunities and critical responsibilities in the coming years. My platform focuses on practical, community-minded priorities.

My two main focuses are:

Upgrading Infrastructure Responsibly: Progress on essential infrastructure cannot wait. I will work to ensure we continue moving forward efficiently on our sewer treatment facility project, so we hit the required 2030 deadline without unnecessary and costly delays.

Fiscal Responsibility & Protecting Taxpayers: As we invest in our community, we must do so wisely. I am dedicated to being financially conscious and maintaining strong fiscal oversight to keep costs down and ease the financial burden on local taxpayers. Every dollar must be spent thoughtfully and transparently.

If re-elected, I will work to achieve these goals in a transparent and responsible way.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 8', 70),
('jim-currie-masset-councillor', 'Jim Currie', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/jim-currie.jpg', $$I've been a Masset village counsellor for six years now and a full-time resident for 10. We collectively accomplished a great many things over these years, including roads, waterlines new equipment and machinery for the airport and Village of Masset and hiring two CAO's amongst many other things.

I've taken the job seriously and learned a great many things along the way with the help of seasoned veterans, Barry Pages, Terry, Carty and Brett Johnson.

I listen first and ask questions to help make informed, wise decisions as a group.

I love this little place we all call home and the people in it. It is nowhere near perfect but it's improving little by little. Working with consultants to update decades old bylaws, and put together important shelf ready projects.

The hiring of our Grant writer Andrew Hudson was in my opinion one of the best moves we've made raising millions of dollars to fund projects that would otherwise not have happened.

I'm proud of the improvements we have made together as a council and with your support look forward to another four years as your voice in Masset thank you.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 9', 10),
('susan-musgrave-masset-councillor', 'Susan Musgrave', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/susan-musgrave.jpg', $$Haida Gwaii has been my home since 1972 and I have lived near Masset for the past 30 years. I own and manage Copper Beech Guest House. I marry all kinds of people — that is, I have been a Marriage Commissioner here since 2013. I teach online in UBC’s School of Creative Writing, write a column, “Living Out Loud” for Haida Gwaii News, and write books — one being A Taste of Haida Gwaii: Food Gathering and Feasting at the Edge of the World: I call it a love story for the people who live and work here, with recipes.

I am running for Village Councillor in Masset. Listening, with quiet attention, not talking, is the role I aspire to taking on. And to reopening a community thrift shop — a volunteer-driven gathering space to become the heart of our town. Let’s stop sending our donations south — donate locally!$$,'Haida Gwaii News · Oct. 8, 2026 · Page 9', 20),
('bret-johnston-masset-councillor', 'Bret Johnston', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/bret-johnston.jpg', $$I’m Bret Johnston, running for re-election as Councillor for the Village of Masset. I bring experience, consistency, and a strong understanding of what it takes to keep our community moving forward.

During my time in office, we’ve completed half of the Village’s water and sewer line upgrades certainly not glamorous work, but absolutely necessary. We have repaved the Village roads and the airport runway. These projects totaling $18,000,000 were funded almost entirely through grants, costing the Village virtually nothing. Smart, careful use of money is the only way small communities like ours can thrive.

We continue to invest in recreation and beautification projects, including the ongoing Park-to-Pier initiative. With limited resources, balancing improvements with proper maintenance and operations is always challenging, but we’ve shown that steady progress is possible.

With your support, I hope to continue strengthening and improving our community.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 9', 30),
('robert-morton-masset-councillor', 'Robert Morton', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/robert-morton.jpg', $$My name is Robert Morton. I am seeking a councillor position in Masset. I have previously held elected councillor positions in this municipality and another, which benefits me with local governance experience. I consider myself to be family oriented, I volunteer for various groups/functions, and I am a Retail Manager in our community. I have many varied interests including fishing, hockey and travelling to new places with my family. As in my last term with Masset, I will lobby for fair, beneficial, and positive changes for our constituents. Why vote for me? Experience(s), honesty, and a desire to make lives better for all.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 9', 40),
('martin-lewis-masset-councillor', 'Martin Lewis', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/martin-lewis.jpg', $$Roots

My connections to these parts go back Pre-Confederation. That unique personal history is my incentive to continue serving our community.

Some short and long-term initiatives for Masset:
• public broadcast (ZOOM) all council meetings
• a new free/thrift store
• housing planning studies/proposals/design competitions
• focus on non-fossil fuel energy options for the future
• public recreation facilities / swimming pool
• waterfront art park
• a robust Main Street downtown development plan
• a new youth centre
• promote health & wellness education
• support for food self-sufficiency

COMMUNITY SERVICE
Delkatla Nature Sanctuary / Board
Masset Haida Lions Club / Board
North End Art Collective / Board
Masset Playhouse / Advisory Board
Tidal Elements Society / Board
Scenes&Scenes of the Forest / Exhibition
Folk Music Workshop / NEAC
Tluu Xaada Naay Society / Consultation
April White Raven House / Consultation

TRANSPARENCY
Everything that I do will be done in consultation with the community.

RESPECT: I will execute our community work with the Haida principle of Yahguudang.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 9', 50),
('jody-grange-masset-councillor', 'Jody Grange', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/jody-grange.jpg', $$I have called Haida Gwaii home for 26 years, and I am running for Masset Council because I care about our community and believe in its potential.

As a business and property owner, I understand budgets, rising costs, regulations, meeting payroll and making every dollar count. I believe Council owes taxpayers the same responsibility and accountability.

My priorities include a cleaner, more attractive and walkable downtown; consistent bylaw enforcement; and finally moving forward with the park on the remediated lot in front of Home Hardware. I would also like more attention given to beautifying the Visitor Information Centre, the seaplane base and our airport grounds.

Most importantly, I want Council to be open, accessible and transparent, with residents able to follow meetings and have a stronger voice in local decisions.

I will listen, ask questions, do my homework and speak up for practical improvements that make Masset better for everyone.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 9', 60),
('peter-sloan-masset-councillor', 'Peter Sloan', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/peter-sloan.jpg', $$After more than 30 years of teaching jewellery casting and as a practicing artist, I believe cooperation and creativity can help build a stronger community. I am an artist, educator and small-business owner who has made Masset my home.

I am running for council to support progressive ideas from other candidates. These include the possibility of establishing a community thrift store in the former library, developing the planned waterfront park, and my long-held notion of the prospect to create an art school or makerspace with accessible studios for jewellery, printmaking, sculpture and other creative activities.

I would also like to explore opportunities for recreation, beautification and sustainable energy, while looking for grants and partnerships that can make worthwhile projects affordable.

Most importantly, I believe council should listen to residents, work cooperatively and approach new ideas with an open mind and a realistic understanding of what Masset can accomplish.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 10', 70),
('kate-stichbury-masset-councillor', 'Kate Stichbury', 'Candidate for Councillor', 'Masset municipal candidates', 'Masset', '/candidate-profiles/kate-stichbury.jpg', $$My name is Kate Stichbury and I am running for councillor in Masset. At the age of 23, I moved here from Victoria for a year of work as a substitute teacher. Now I’m 36, and I’m still here. I figure it is time to do something helpful. Masset has been so good to me and I love Masset.

I am still learning.

While I have my own personal interests, I believe that good leaders listen to the people they are serving, and work, turning those thoughts into reality. My interests include Literacy, Social Services, and Housing. As a municipality, I believe in the strength of partnership with Old Masset Village Council.

When I think about my mentors in leadership, my guiding principle is, “what would Leslie do?” Everything I know about being good, I learned from Leslie Bellis.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 10', 80),
('scott-cabianca-port-clements-mayor', 'Scott Cabianca', 'Candidate for Mayor', 'Port Clements municipal candidates', 'Port Clements', '/candidate-profiles/scott-cabianca.jpg', $$As Mayor of Port Clements, I’ve learned that the role means getting things done locally, and representing our community beyond the village.

I’ve built relationships with the Province, Council of the Haida Nation, NCRD, School District and Island elected officials—giving Port Clements a strong voice on issues affecting Port and Haida Gwaii.

Here in Port, Council advanced projects, including the new sewage lagoon, Tingley Street watermain replacement and Community Park playground. I’ve pursued opportunities like Whitecaps Mini PEAKS and effectively advocated to preserve K–7 education at our school.

Looking ahead, I want Port Clements to be a community for every generation—with more programs for youth, better access to local healthcare and housing for seniors, support for jobs and businesses, and opportunities for entrepreneurs.

My approach is straightforward: understand what Port needs, build relationships, find a way forward, and get it done. I respectfully ask for your vote.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 10', 10),
('kazamir-falconbridge-port-clements-mayor', 'Kazamir Falconbridge', 'Candidate for Mayor', 'Port Clements municipal candidates', 'Port Clements', '/candidate-profiles/kazamir-falconbridge.jpg', $$Since arriving in 2008, I have been committed to serving Port Clements through local government and community service. Over 11 years as a Village Councillor and as an active member of the Port Clements Volunteer Fire Department since 2008, I have worked alongside residents, volunteers, businesses, and regional partners to help strengthen our community. I am running for Mayor because I believe it is time to step into a greater leadership role and build on the work already underway.

My priorities are protecting local jobs, improving infrastructure, and helping Port Clements navigate the transition to the new forestry model. I will advocate for continued economic development, support seniors' housing, improve water and drainage infrastructure, strengthen emergency preparedness, and continue supporting our Volunteer Fire Department. I will also work to ensure Port Clements has a strong voice in regional decision-making and maintain productive partnerships across Haida Gwaii and beyond. Transparency, fairness, teamwork, and practical solutions will guide my leadership.

This is a big island with a small population, and we're all in it together.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 10', 20),
('robert-kidd-port-clements-mayor', 'Robert Kidd', 'Candidate for Mayor', 'Port Clements municipal candidates', 'Port Clements', '/candidate-profiles/robert-kidd.jpg', $$I have lived and worked in the Village of Port Clements for the past 17 years. During my career with the Regional District, I ran Island Solid Waste management services and worked with all levels of government. After retiring, I was approached to assist the Village as superintendent when the previous superintendent moved on. In that roll, I worked on upgrading the water system and wells, completed outstanding projects, and gained insite into Village operations and staff.

For my own reasons I moved on. I have been encouraged many times to put my name forth for election, but work kept me busy. After reading an article in the Haida Gwaii news about giving people a choice, I decided this was the right time to step forward. I look forward to working with council and Village staff to make positive changes for our community.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 10', 30),
('doris-fischer-port-clements-councillor', 'Doris Fischer', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', '/candidate-profiles/doris-fischer.jpg', $$I am Doris Fischer, I’m running for Council. Living in Port Clements since 2019, I’m working as an architectural technologist, remotely for the last 6 years. I bring experience from different board positions, six years on the board of the Historical Society in Port Clements, five years on the board of the Canadian Construction Woman in Vancouver, six years on the board of examiners for drafters at the Chamber of Commerce in Dusseldorf, Germany, four years of these as the president. Beside that I served 6 years as president of a board of staff representatives at a big architecture firm in Dusseldorf representing 400 employees.

I am running for council to give back to my community and help, as part of an elected team, to run the village in a responsible way to the benefit of everybody.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 12', 60),
('derek-hardt-port-clements-councillor', 'Derek Hardt', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', '/candidate-profiles/derek-hardt.jpg', $$My name is Derek Hardt, and I am putting my name forward as a candidate for Council in the Village of Port Clements.

I have lived and worked in Haida Gwaii for the past ten years and have built my career in heavy equipment operation, civil construction, and my local business, Rocking Island Rock. These experiences have taught me the importance of hard work, responsible decision-making, and following through on commitments.

I’m running because I care about the future of Port Clements and want to contribute to a strong, sustainable community. If elected, I hope to support responsible economic development, encourage tourism and local business opportunities, maintain and improve community infrastructure, and help create opportunities that keep our community vibrant and attractive for residents and visitors.

Most importantly, I want to listen to the people of Port Clements, share their ideas and vision at the Council table, and work together to turn good ideas into meaningful progress for our community.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 12', 70),
('sarah-hunt-port-clements-councillor', 'Sarah Hunt', 'Candidate for Councillor', 'Port Clements municipal candidates', 'Port Clements', '/candidate-profiles/sarah-hunt.jpg', $$I believe our community deserves to be heard — truly heard.

As a mother, homeowner, and businesswoman, I understand the importance of a community where families can thrive, businesses can grow, and people feel proud to call home.

I want to help move our community forward by embracing responsible growth, supporting new opportunities, and taking a forward-thinking approach to our future.

I want to be a voice for a town where residents feel informed, respected, and valued — and where decisions are made with the community, not simply for it.

Your voice matters. Your perspective matters. And your community deserves to be represented by someone who will bring a fresh perspective to the table, and work toward a stronger future.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 12', 80),
('meggan-wood-trustee-area-5', 'Meggan Wood', 'School Trustee candidate', 'School Board Trustee · Area 5 - South', 'Daajing Giids, Miller Creek and Gwaii Haanas', '/candidate-profiles/meggan-wood.jpg', $$I am Meggan Wood and I am seeking election as a School District 50 Trustee for Daajing Giids, Sandspit and Miller Creek. As a healthcare leader for over a decade, a Registered Nurse for 20 years, an Indigenous woman, and a Master of Education graduate, I bring a unique combination of leadership, healthcare, education, and lived experience to this role.

Through five years of PAC involvement (four years as executive), I have worked closely with schools, families, and community members, gaining valuable insight into the opportunities and challenges facing students in SD50.

I am committed to transparency, student safety, and strong educational outcomes. By prioritizing literacy and numeracy, strengthening student supports, addressing school violence, and fostering inclusive, respectful learning environments, I will advocate for every student to feel safe, valued, and empowered to reach their full potential. I would be honoured to be a strong voice for students, families, and staff.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 12', 10),
('lindsay-seegmiller-trustee-area-5', 'Lindsay Seegmiller', 'School Trustee candidate', 'School Board Trustee · Area 5 - South', 'Daajing Giids, Miller Creek and Gwaii Haanas', '/candidate-profiles/lindsay-seegmiller.jpg', $$I’m running for Trustee because I’m proud of the education my daughter has received here, because I have concerns about the direction we’re heading in and - most importantly - because I believe too deeply in the value public schools provide to not be part of making things better.

I’m newer to the education system, but I’m not new to helping complex public and community-based organizations work better through leadership and governance. As a trustee, I’ll do what I do best: show up prepared to listen to different perspectives, ask good questions, and use what I learn to help the Board make thoughtful decisions about what students and schools need.

I’ll focus particular attention on strengthening support for literacy and numeracy, increasing transparency of District decision-making, and ensuring the voices of students, staff and families are well-represented.

Want to connect or learn more? Connect with me on Facebook/Instagram @lindsayseegmiller.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 12', 20),
('miranda-post-trustee-area-5', 'Miranda Post', 'School Trustee candidate', 'School Board Trustee · Area 5 - South', 'Daajing Giids, Miller Creek and Gwaii Haanas', '/candidate-profiles/miranda-post.jpg', $$I'm running for re-election as a Haida Gwaii School District Board Trustee Area 5 (Daajing Giids, K’il Kun and Miller Creek). I joined the board in 2022 because I was curious about my son’s education. I also wanted to contribute to our communities in a way that embraces: care, Haida knowledge, a shared sense of the future, achievement, and respect. I'm not afraid to ask hard questions or have difficult conversations when our learners' needs are at stake.

Schools are the heart of our communities and should be a places of both belonging and learning.

For my second term, I bring experience, collaboration, and respect to the table. Equity in education matters deeply to me including: creative, qualified support for kids with learning exceptionalities, mental health resources and well-funded school food programs. I want to continue listening and learning from students, families and educators to effect positive change in our district. Let’s talk: mirandapost@shaw.ca.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 12', 30),
('ashley-currie-trustee-area-2', 'Ashley Currie', 'School Trustee candidate', 'School Board Trustee · Area 2 - North', 'Masset and Taaw Tládaaw', '/candidate-profiles/ashley-currie.jpg', $$I’m Ashley Currie, and I’m asking for support as I run for a second term as a Haida Gwaii School District Trustee.

The past four years have been a learning experience. I’ve learned about our district, and I’ve had the opportunity to listen to students, parents, staff and communities and hear what matters to them.

I’m proud of what our Board has accomplished, including the completion of Daaxiigan Sk’adáa Née K-12 School, strengthening strategic planning, supporting Haida ways of knowing in our schools and advocating for the resources our students and staff need.

As a parent of two children in school, I care about our district’s educational goals and the opportunities we can provide our kids—as a board, as parents and as communities.

I’m asking for your vote on October 17. It would be an honour to continue listening and advocating for Haida Gwaii students and schools. Let’s talk: ashleycurrie321@gmail.com$$,'Haida Gwaii News · Oct. 8, 2026 · Page 13', 10),
('tammy-gates-trustee-area-2', 'Tammy Gates', 'School Trustee candidate', 'School Board Trustee · Area 2 - North', 'Masset and Taaw Tládaaw', '/candidate-profiles/tammy-gates.jpg', $$I am running for Masset/Tow Hill Trustee because I believe ALL schools are integral to their communities. Growing up on Haida Gwaii, being Haida and working as an educator allows me to continue to be accessible, attentive and accountable to the concerns and ideas from families, students and staff. My numerous collaboration experiences on boards and committees will be a positive addition to the team.

Responsibly reviewing the budget ensures educational, Haida language, food, outdoor and cultural (etc) programs across ALL schools are prioritized. Helping develop the new Strategic Plan shows my commitment to ensuring the goals are translated into meaningful actions, opportunities are equitable for ALL our communities and commitment to Reconciliation is honoured. I am privileged to serve the students and families of Masset and Tow Hill in continuing to build a strong future for all of our youth. Vote for me, Tammy G!$$,'Haida Gwaii News · Oct. 8, 2026 · Page 13', 20),
('jam-clark-trustee-area-3', 'Jam Clark', 'School Trustee candidate', 'School Board Trustee · Area 3 - Central', 'Port Clements, Tllaal and Lawn Hill', '/candidate-profiles/jam-clark.jpg', $$I’m Jam (Jamie, or Donald James depending who you ask)—husband, father, business owner, beekeeper, musician, PAC President and proud Tlellian.

I’ve volunteered at my children’s schools since 2018. After years farming in Campbell River and working away in commercial fishing, tugboating and the oilfield, I left shift work in 2020 and began supporting my wife’s apothecary business before starting my own wholesale soap manufacturing business.

For six years, I’ve served as PAC President at two schools, helping raise and direct more than $100,000 through fundraising, grants and donations. Getting resources for kids is kind of my thing.

I grew up in Sayward, a small logging community on Vancouver Island, so I understand the importance of schools as the heart of small communities. I believe in equitable funding, listening, speaking up, transparency and, above all, putting kids first.

I’m running to be a strong, righteous voice for Port Clements, Tlell and Lawn Hill. Let’s get things done.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 13', 10),
('kim-nickel-trustee-area-3', 'Kim Nickel', 'School Trustee candidate', 'School Board Trustee · Area 3 - Central', 'Port Clements, Tllaal and Lawn Hill', '/candidate-profiles/kim-nickel.jpg', $$Education has been at the heart of my professional life for 25 years. Throughout my career in post-secondary education, I have had the privilege of guiding learners to succeed and seeing how quality teaching, transformative learning, and strong leadership can change lives. I recently defended my Doctorate in Education, in part to honour students who are willing to be brave, take risks, and try.

I am seeking to serve as a School District 50 trustee to provide thoughtful, informed, and effective leadership, bringing the experience and perspective I have gained throughout my career and academic journey in education.

I will listen carefully, ask thoughtful questions, and work constructively to turn good ideas into meaningful action.

I value what makes Haida Gwaii unique and will respect its culture, history, and territory, including the vital role of Haida knowledge, language, culture, and Laws in education.

I bring curiosity, integrity, and a genuine commitment to lifelong learning. I look forward to listening, learning, and working together to support students and strengthen our schools.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 13', 20),
('jennifer-jury-trustee-area-3', 'Jennifer Jury', 'School Trustee candidate', 'School Board Trustee · Area 3 - Central', 'Port Clements, Tllaal and Lawn Hill', '/candidate-profiles/jennifer-jury.jpg', $$In 2008, Haida Gwaii became home to my family. Since then, our schools have been central to my life as a parent and educator. I have taught every grade and worked in every school here. I understand how education works as a system, and I know that a school is a vital part of its community.

I like finding possibilities to complex problems. I will listen, ask questions and use my voice to be your voice at the board table.

Children do best when they can learn in the community where they live and feel connected. I will never vote in favour of closing a school. When budgets are tight, I will keep looking for ways forward that put kids first.$$,'Haida Gwaii News · Oct. 8, 2026 · Page 13', 30)
on conflict (slug) do update set
  candidate_name = excluded.candidate_name,
  office = excluded.office,
  race_name = excluded.race_name,
  community = excluded.community,
  portrait_url = excluded.portrait_url,
  statement = excluded.statement,
  source_label = excluded.source_label,
  sort_order = excluded.sort_order,
  updated_at = now();
