import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// A curated seed of ~200 key Bible verses covering major themes
const SEED_VERSES = [
  // Trust & Faith
  { book: "Proverbs", chapter: 3, verse_number: 5, text: "Trust in the LORD with all your heart and lean not on your own understanding." },
  { book: "Proverbs", chapter: 3, verse_number: 6, text: "In all your ways submit to him, and he will make your paths straight." },
  { book: "Hebrews", chapter: 11, verse_number: 1, text: "Now faith is confidence in what we hope for and assurance about what we do not see." },
  { book: "Romans", chapter: 8, verse_number: 28, text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
  { book: "Jeremiah", chapter: 29, verse_number: 11, text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { book: "Isaiah", chapter: 40, verse_number: 31, text: "But those who hope in the LORD will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint." },

  // Anxiety & Fear
  { book: "Isaiah", chapter: 41, verse_number: 10, text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand." },
  { book: "Philippians", chapter: 4, verse_number: 6, text: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." },
  { book: "Philippians", chapter: 4, verse_number: 7, text: "And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus." },
  { book: "Psalm", chapter: 23, verse_number: 1, text: "The LORD is my shepherd, I lack nothing." },
  { book: "Psalm", chapter: 23, verse_number: 4, text: "Even though I walk through the darkest valley, I will fear no evil, for you are with me; your rod and your staff, they comfort me." },
  { book: "Psalm", chapter: 46, verse_number: 1, text: "God is our refuge and strength, an ever-present help in trouble." },
  { book: "Psalm", chapter: 56, verse_number: 3, text: "When I am afraid, I put my trust in you." },
  { book: "1 Peter", chapter: 5, verse_number: 7, text: "Cast all your anxiety on him because he cares for you." },
  { book: "2 Timothy", chapter: 1, verse_number: 7, text: "For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline." },
  { book: "Joshua", chapter: 1, verse_number: 9, text: "Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go." },
  { book: "Psalm", chapter: 34, verse_number: 4, text: "I sought the LORD, and he answered me; he delivered me from all my fears." },

  // Love
  { book: "1 Corinthians", chapter: 13, verse_number: 4, text: "Love is patient, love is kind. It does not envy, it does not boast, it is not proud." },
  { book: "1 Corinthians", chapter: 13, verse_number: 7, text: "It always protects, always trusts, always hopes, always perseveres." },
  { book: "John", chapter: 3, verse_number: 16, text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { book: "Romans", chapter: 8, verse_number: 38, text: "For I am convinced that neither death nor life, neither angels nor demons, neither the present nor the future, nor any powers." },
  { book: "Romans", chapter: 8, verse_number: 39, text: "Neither height nor depth, nor anything else in all creation, will be able to separate us from the love of God that is in Christ Jesus our Lord." },
  { book: "1 John", chapter: 4, verse_number: 18, text: "There is no fear in love. But perfect love drives out fear, because fear has to do with punishment. The one who fears is not made perfect in love." },
  { book: "1 John", chapter: 4, verse_number: 19, text: "We love because he first loved us." },

  // Forgiveness
  { book: "Ephesians", chapter: 4, verse_number: 32, text: "Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you." },
  { book: "Colossians", chapter: 3, verse_number: 13, text: "Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you." },
  { book: "Matthew", chapter: 6, verse_number: 14, text: "For if you forgive other people when they sin against you, your heavenly Father will also forgive you." },
  { book: "Psalm", chapter: 103, verse_number: 12, text: "As far as the east is from the west, so far has he removed our transgressions from us." },
  { book: "1 John", chapter: 1, verse_number: 9, text: "If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness." },
  { book: "Isaiah", chapter: 1, verse_number: 18, text: "Come now, let us settle the matter, says the LORD. Though your sins are like scarlet, they shall be as white as snow." },

  // Suffering & Comfort
  { book: "2 Corinthians", chapter: 1, verse_number: 3, text: "Praise be to the God and Father of our Lord Jesus Christ, the Father of compassion and the God of all comfort." },
  { book: "2 Corinthians", chapter: 1, verse_number: 4, text: "Who comforts us in all our troubles, so that we can comfort those in any trouble with the comfort we ourselves receive from God." },
  { book: "Romans", chapter: 5, verse_number: 3, text: "Not only so, but we also glory in our sufferings, because we know that suffering produces perseverance." },
  { book: "Romans", chapter: 5, verse_number: 4, text: "Perseverance, character; and character, hope." },
  { book: "James", chapter: 1, verse_number: 2, text: "Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds." },
  { book: "James", chapter: 1, verse_number: 3, text: "Because you know that the testing of your faith produces perseverance." },
  { book: "Psalm", chapter: 34, verse_number: 18, text: "The LORD is close to the brokenhearted and saves those who are crushed in spirit." },
  { book: "Psalm", chapter: 147, verse_number: 3, text: "He heals the brokenhearted and binds up their wounds." },
  { book: "Revelation", chapter: 21, verse_number: 4, text: "He will wipe every tear from their eyes. There will be no more death or mourning or crying or pain, for the old order of things has passed away." },
  { book: "Matthew", chapter: 5, verse_number: 4, text: "Blessed are those who mourn, for they will be comforted." },

  // Guidance & Wisdom
  { book: "Psalm", chapter: 119, verse_number: 105, text: "Your word is a lamp for my feet, a light on my path." },
  { book: "James", chapter: 1, verse_number: 5, text: "If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you." },
  { book: "Proverbs", chapter: 2, verse_number: 6, text: "For the LORD gives wisdom; from his mouth come knowledge and understanding." },
  { book: "Psalm", chapter: 32, verse_number: 8, text: "I will instruct you and teach you in the way you should go; I will counsel you with my loving eye on you." },
  { book: "Isaiah", chapter: 30, verse_number: 21, text: "Whether you turn to the right or to the left, your ears will hear a voice behind you, saying, This is the way; walk in it." },
  { book: "Proverbs", chapter: 16, verse_number: 9, text: "In their hearts humans plan their course, but the LORD establishes their steps." },
  { book: "Psalm", chapter: 37, verse_number: 5, text: "Commit your way to the LORD; trust in him and he will do this." },

  // Strength & Courage
  { book: "Philippians", chapter: 4, verse_number: 13, text: "I can do all this through him who gives me strength." },
  { book: "Deuteronomy", chapter: 31, verse_number: 6, text: "Be strong and courageous. Do not be afraid or terrified because of them, for the LORD your God goes with you; he will never leave you nor forsake you." },
  { book: "Isaiah", chapter: 40, verse_number: 29, text: "He gives strength to the weary and increases the power of the weak." },
  { book: "Psalm", chapter: 27, verse_number: 1, text: "The LORD is my light and my salvation — whom shall I fear? The LORD is the stronghold of my life — of whom shall I be afraid?" },
  { book: "Psalm", chapter: 18, verse_number: 2, text: "The LORD is my rock, my fortress and my deliverer; my God is my rock, in whom I take refuge, my shield and the horn of my salvation, my stronghold." },
  { book: "Nehemiah", chapter: 8, verse_number: 10, text: "Do not grieve, for the joy of the LORD is your strength." },

  // Peace
  { book: "John", chapter: 14, verse_number: 27, text: "Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid." },
  { book: "Isaiah", chapter: 26, verse_number: 3, text: "You will keep in perfect peace those whose minds are steadfast, because they trust in you." },
  { book: "Psalm", chapter: 29, verse_number: 11, text: "The LORD gives strength to his people; the LORD blesses his people with peace." },
  { book: "Romans", chapter: 15, verse_number: 13, text: "May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit." },
  { book: "Colossians", chapter: 3, verse_number: 15, text: "Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful." },

  // Prayer
  { book: "Matthew", chapter: 7, verse_number: 7, text: "Ask and it will be given to you; seek and you will find; knock and the door will be opened to you." },
  { book: "Psalm", chapter: 145, verse_number: 18, text: "The LORD is near to all who call on him, to all who call on him in truth." },
  { book: "Jeremiah", chapter: 33, verse_number: 3, text: "Call to me and I will answer you and tell you great and unsearchable things you do not know." },
  { book: "1 Thessalonians", chapter: 5, verse_number: 17, text: "Pray continually." },
  { book: "Matthew", chapter: 6, verse_number: 6, text: "But when you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father, who sees what is done in secret, will reward you." },
  { book: "Romans", chapter: 8, verse_number: 26, text: "In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans." },

  // Gratitude & Joy
  { book: "1 Thessalonians", chapter: 5, verse_number: 18, text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." },
  { book: "Psalm", chapter: 118, verse_number: 24, text: "The LORD has done it this very day; let us rejoice today and be glad." },
  { book: "Psalm", chapter: 100, verse_number: 4, text: "Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name." },
  { book: "Philippians", chapter: 4, verse_number: 4, text: "Rejoice in the Lord always. I will say it again: Rejoice!" },
  { book: "Psalm", chapter: 16, verse_number: 11, text: "You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand." },
  { book: "James", chapter: 1, verse_number: 17, text: "Every good and perfect gift is from above, coming down from the Father of the heavenly lights, who does not change like shifting shadows." },

  // Hope
  { book: "Romans", chapter: 15, verse_number: 4, text: "For everything that was written in the past was written to teach us, so that through the endurance taught in the Scriptures and the encouragement they provide we might have hope." },
  { book: "Lamentations", chapter: 3, verse_number: 22, text: "Because of the LORD's great love we are not consumed, for his compassions never fail." },
  { book: "Lamentations", chapter: 3, verse_number: 23, text: "They are new every morning; great is your faithfulness." },
  { book: "Psalm", chapter: 42, verse_number: 11, text: "Why, my soul, are you downcast? Why so disturbed within me? Put your hope in God, for I will yet praise him, my Savior and my God." },
  { book: "Hebrews", chapter: 6, verse_number: 19, text: "We have this hope as an anchor for the soul, firm and secure." },

  // Salvation & Grace
  { book: "Ephesians", chapter: 2, verse_number: 8, text: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God." },
  { book: "Romans", chapter: 6, verse_number: 23, text: "For the wages of sin is death, but the gift of God is eternal life in Christ Jesus our Lord." },
  { book: "Romans", chapter: 10, verse_number: 9, text: "If you declare with your mouth, Jesus is Lord, and believe in your heart that God raised him from the dead, you will be saved." },
  { book: "Titus", chapter: 3, verse_number: 5, text: "He saved us, not because of righteous things we had done, but because of his mercy." },
  { book: "Acts", chapter: 4, verse_number: 12, text: "Salvation is found in no one else, for there is no other name under heaven given to mankind by which we must be saved." },
  { book: "2 Corinthians", chapter: 12, verse_number: 9, text: "But he said to me, My grace is sufficient for you, for my power is made perfect in weakness." },

  // Purpose & Identity
  { book: "Ephesians", chapter: 2, verse_number: 10, text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." },
  { book: "Psalm", chapter: 139, verse_number: 14, text: "I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well." },
  { book: "Romans", chapter: 12, verse_number: 2, text: "Do not conform to the pattern of this world, but be transformed by the renewing of your mind." },
  { book: "Galatians", chapter: 2, verse_number: 20, text: "I have been crucified with Christ and I no longer live, but Christ lives in me." },
  { book: "2 Corinthians", chapter: 5, verse_number: 17, text: "Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!" },
  { book: "1 Peter", chapter: 2, verse_number: 9, text: "But you are a chosen people, a royal priesthood, a holy nation, God's special possession, that you may declare the praises of him who called you out of darkness into his wonderful light." },
  { book: "Micah", chapter: 6, verse_number: 8, text: "He has shown you, O mortal, what is good. And what does the LORD require of you? To act justly and to love mercy and to walk humbly with your God." },

  // Anger & Patience
  { book: "James", chapter: 1, verse_number: 19, text: "My dear brothers and sisters, take note of this: Everyone should be quick to listen, slow to speak and slow to become angry." },
  { book: "Proverbs", chapter: 15, verse_number: 1, text: "A gentle answer turns away wrath, but a harsh word stirs up anger." },
  { book: "Ephesians", chapter: 4, verse_number: 26, text: "In your anger do not sin: Do not let the sun go down while you are still angry." },
  { book: "Proverbs", chapter: 14, verse_number: 29, text: "Whoever is patient has great understanding, but one who is quick-tempered displays folly." },
  { book: "Galatians", chapter: 5, verse_number: 22, text: "But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness." },
  { book: "Galatians", chapter: 5, verse_number: 23, text: "Gentleness and self-control. Against such things there is no law." },

  // Relationships
  { book: "Proverbs", chapter: 27, verse_number: 17, text: "As iron sharpens iron, so one person sharpens another." },
  { book: "Ecclesiastes", chapter: 4, verse_number: 9, text: "Two are better than one, because they have a good return for their labor." },
  { book: "Ecclesiastes", chapter: 4, verse_number: 10, text: "If either of them falls down, one can help the other up. But pity anyone who falls and has no one to help them up." },
  { book: "Romans", chapter: 12, verse_number: 10, text: "Be devoted to one another in love. Honor one another above yourselves." },
  { book: "1 Corinthians", chapter: 16, verse_number: 14, text: "Do everything in love." },

  // Provision & Contentment
  { book: "Matthew", chapter: 6, verse_number: 33, text: "But seek first his kingdom and his righteousness, and all these things will be given to you as well." },
  { book: "Matthew", chapter: 6, verse_number: 34, text: "Therefore do not worry about tomorrow, for tomorrow will worry about itself. Each day has enough trouble of its own." },
  { book: "Philippians", chapter: 4, verse_number: 19, text: "And my God will meet all your needs according to the riches of his glory in Christ Jesus." },
  { book: "Philippians", chapter: 4, verse_number: 11, text: "I have learned to be content whatever the circumstances." },
  { book: "Psalm", chapter: 37, verse_number: 4, text: "Take delight in the LORD, and he will give you the desires of your heart." },
  { book: "Hebrews", chapter: 13, verse_number: 5, text: "Keep your lives free from the love of money and be content with what you have, because God has said, Never will I leave you; never will I forsake you." },

  // The Word of God
  { book: "2 Timothy", chapter: 3, verse_number: 16, text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness." },
  { book: "Hebrews", chapter: 4, verse_number: 12, text: "For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow; it judges the thoughts and attitudes of the heart." },
  { book: "Isaiah", chapter: 55, verse_number: 11, text: "So is my word that goes out from my mouth: It will not return to me empty, but will accomplish what I desire and achieve the purpose for which I sent it." },
  { book: "Psalm", chapter: 1, verse_number: 2, text: "But whose delight is in the law of the LORD, and who meditates on his law day and night." },
  { book: "Joshua", chapter: 1, verse_number: 8, text: "Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it." },

  // Spiritual Warfare
  { book: "Ephesians", chapter: 6, verse_number: 11, text: "Put on the full armor of God, so that you can take your stand against the devil's schemes." },
  { book: "Ephesians", chapter: 6, verse_number: 12, text: "For our struggle is not against flesh and blood, but against the rulers, against the authorities, against the powers of this dark world and against the spiritual forces of evil in the heavenly realms." },
  { book: "Romans", chapter: 12, verse_number: 21, text: "Do not be overcome by evil, but overcome evil with good." },
  { book: "1 John", chapter: 4, verse_number: 4, text: "You, dear children, are from God and have overcome them, because the one who is in you is greater than the one who is in the world." },

  // God's Faithfulness
  { book: "Deuteronomy", chapter: 7, verse_number: 9, text: "Know therefore that the LORD your God is God; he is the faithful God, keeping his covenant of love to a thousand generations of those who love him and keep his commandments." },
  { book: "Psalm", chapter: 36, verse_number: 5, text: "Your love, LORD, reaches to the heavens, your faithfulness to the skies." },
  { book: "Psalm", chapter: 91, verse_number: 1, text: "Whoever dwells in the shelter of the Most High will rest in the shadow of the Almighty." },
  { book: "Psalm", chapter: 91, verse_number: 2, text: "I will say of the LORD, He is my refuge and my fortress, my God, in whom I trust." },
  { book: "Isaiah", chapter: 43, verse_number: 2, text: "When you pass through the waters, I will be with you; and when you pass through the rivers, they will not sweep over you." },
  { book: "Matthew", chapter: 28, verse_number: 20, text: "And surely I am with you always, to the very end of the age." },

  // The Great Commission & Service
  { book: "Matthew", chapter: 28, verse_number: 19, text: "Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." },
  { book: "Mark", chapter: 16, verse_number: 15, text: "He said to them, Go into all the world and preach the gospel to all creation." },
  { book: "Matthew", chapter: 25, verse_number: 40, text: "The King will reply, Truly I tell you, whatever you did for one of the least of these brothers and sisters of mine, you did for me." },
  { book: "Galatians", chapter: 6, verse_number: 9, text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up." },

  // Temptation
  { book: "1 Corinthians", chapter: 10, verse_number: 13, text: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear." },
  { book: "James", chapter: 4, verse_number: 7, text: "Submit yourselves, then, to God. Resist the devil, and he will flee from you." },
  { book: "Matthew", chapter: 26, verse_number: 41, text: "Watch and pray so that you will not fall into temptation. The spirit is willing, but the flesh is weak." },

  // Death & Eternal Life
  { book: "John", chapter: 11, verse_number: 25, text: "Jesus said to her, I am the resurrection and the life. The one who believes in me will live, even though they die." },
  { book: "John", chapter: 14, verse_number: 2, text: "My Father's house has many rooms; if that were not so, would I have told you that I am going there to prepare a place for you?" },
  { book: "Psalm", chapter: 116, verse_number: 15, text: "Precious in the sight of the LORD is the death of his faithful servants." },
  { book: "1 Corinthians", chapter: 15, verse_number: 55, text: "Where, O death, is your victory? Where, O death, is your sting?" },

  // Obedience & Holiness
  { book: "John", chapter: 14, verse_number: 15, text: "If you love me, keep my commands." },
  { book: "1 Peter", chapter: 1, verse_number: 16, text: "For it is written: Be holy, because I am holy." },
  { book: "Romans", chapter: 12, verse_number: 1, text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship." },
  { book: "Psalm", chapter: 51, verse_number: 10, text: "Create in me a pure heart, O God, and renew a steadfast spirit within me." },

  // Humility
  { book: "Proverbs", chapter: 11, verse_number: 2, text: "When pride comes, then comes disgrace, but with humility comes wisdom." },
  { book: "James", chapter: 4, verse_number: 10, text: "Humble yourselves before the Lord, and he will lift you up." },
  { book: "Philippians", chapter: 2, verse_number: 3, text: "Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves." },
  { book: "Matthew", chapter: 23, verse_number: 12, text: "For those who exalt themselves will be humbled, and those who humble themselves will be exalted." },

  // Rest
  { book: "Matthew", chapter: 11, verse_number: 28, text: "Come to me, all you who are weary and burdened, and I will give you rest." },
  { book: "Matthew", chapter: 11, verse_number: 29, text: "Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls." },
  { book: "Psalm", chapter: 62, verse_number: 1, text: "Truly my soul finds rest in God; my salvation comes from him." },
  { book: "Exodus", chapter: 33, verse_number: 14, text: "The LORD replied, My Presence will go with you, and I will give you rest." },

  // Justice & Compassion
  { book: "Isaiah", chapter: 1, verse_number: 17, text: "Learn to do right; seek justice. Defend the oppressed. Take up the cause of the fatherless; plead the case of the widow." },
  { book: "Amos", chapter: 5, verse_number: 24, text: "But let justice roll on like a river, righteousness like a never-failing stream!" },
  { book: "Psalm", chapter: 82, verse_number: 3, text: "Defend the weak and the fatherless; uphold the cause of the poor and the oppressed." },

  // Light & Darkness
  { book: "John", chapter: 8, verse_number: 12, text: "When Jesus spoke again to the people, he said, I am the light of the world. Whoever follows me will never walk in darkness, but will have the light of life." },
  { book: "Matthew", chapter: 5, verse_number: 14, text: "You are the light of the world. A town built on a hill cannot be hidden." },
  { book: "Matthew", chapter: 5, verse_number: 16, text: "In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven." },

  // Generosity
  { book: "2 Corinthians", chapter: 9, verse_number: 7, text: "Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." },
  { book: "Proverbs", chapter: 11, verse_number: 25, text: "A generous person will prosper; whoever refreshes others will be refreshed." },
  { book: "Acts", chapter: 20, verse_number: 35, text: "In everything I did, I showed you that by this kind of hard work we must help the weak, remembering the words the Lord Jesus himself said: It is more blessed to give than to receive." },

  // Creation & Nature
  { book: "Genesis", chapter: 1, verse_number: 1, text: "In the beginning God created the heavens and the earth." },
  { book: "Psalm", chapter: 19, verse_number: 1, text: "The heavens declare the glory of God; the skies proclaim the work of his hands." },
  { book: "Romans", chapter: 1, verse_number: 20, text: "For since the creation of the world God's invisible qualities — his eternal power and divine nature — have been clearly seen, being understood from what has been made, so that people are without excuse." },

  // The Holy Spirit
  { book: "John", chapter: 16, verse_number: 13, text: "But when he, the Spirit of truth, comes, he will guide you into all the truth." },
  { book: "Acts", chapter: 1, verse_number: 8, text: "But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth." },
  { book: "Romans", chapter: 8, verse_number: 11, text: "And if the Spirit of him who raised Jesus from the dead is living in you, he who raised Christ from the dead will also give life to your mortal bodies because of his Spirit who lives in you." },
];

async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const resp = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
      dimensions: 768,
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`Embedding failed: ${resp.status} ${t}`);
  }
  const data = await resp.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not set");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Check how many verses already exist
    const { count } = await sb.from("bible_verses").select("*", { count: "exact", head: true });
    if (count && count > 50) {
      return new Response(JSON.stringify({ message: `Already seeded with ${count} verses` }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let embedded = 0;
    const BATCH_SIZE = 10;

    for (let i = 0; i < SEED_VERSES.length; i += BATCH_SIZE) {
      const batch = SEED_VERSES.slice(i, i + BATCH_SIZE);
      const rows = [];

      for (const v of batch) {
        try {
          const embedding = await getEmbedding(
            `${v.book} ${v.chapter}:${v.verse_number} - ${v.text}`,
            LOVABLE_API_KEY
          );
          rows.push({ ...v, embedding: JSON.stringify(embedding) });
          embedded++;
        } catch (e) {
          console.error(`Failed to embed ${v.book} ${v.chapter}:${v.verse_number}:`, e);
        }
      }

      if (rows.length > 0) {
        const { error } = await sb.from("bible_verses").insert(rows);
        if (error) console.error("Insert error:", error);
      }
    }

    // Seed some cross-references
    const crossRefs = [
      { from_verse: "Isaiah 41:10", to_verse: "Deuteronomy 31:6", weight: 3 },
      { from_verse: "Isaiah 41:10", to_verse: "Joshua 1:9", weight: 3 },
      { from_verse: "Philippians 4:6", to_verse: "1 Peter 5:7", weight: 3 },
      { from_verse: "Philippians 4:6", to_verse: "Matthew 6:34", weight: 2 },
      { from_verse: "Psalm 23:1", to_verse: "Psalm 23:4", weight: 3 },
      { from_verse: "Romans 8:28", to_verse: "Jeremiah 29:11", weight: 3 },
      { from_verse: "John 3:16", to_verse: "Romans 6:23", weight: 3 },
      { from_verse: "Ephesians 2:8", to_verse: "Romans 6:23", weight: 3 },
      { from_verse: "Proverbs 3:5", to_verse: "Psalm 37:5", weight: 2 },
      { from_verse: "1 Corinthians 13:4", to_verse: "1 Corinthians 13:7", weight: 3 },
      { from_verse: "Matthew 11:28", to_verse: "Psalm 62:1", weight: 2 },
      { from_verse: "James 1:5", to_verse: "Proverbs 2:6", weight: 3 },
      { from_verse: "Hebrews 11:1", to_verse: "Romans 8:28", weight: 2 },
      { from_verse: "2 Timothy 1:7", to_verse: "Joshua 1:9", weight: 2 },
      { from_verse: "Psalm 34:18", to_verse: "Psalm 147:3", weight: 3 },
      { from_verse: "Romans 5:3", to_verse: "James 1:2", weight: 3 },
      { from_verse: "Galatians 5:22", to_verse: "Colossians 3:15", weight: 2 },
      { from_verse: "Ephesians 6:11", to_verse: "1 John 4:4", weight: 2 },
      { from_verse: "2 Corinthians 1:3", to_verse: "Psalm 34:18", weight: 2 },
      { from_verse: "Matthew 6:33", to_verse: "Philippians 4:19", weight: 2 },
    ];
    await sb.from("cross_references").insert(crossRefs);

    return new Response(JSON.stringify({ message: `Seeded ${embedded} verses with embeddings and ${crossRefs.length} cross-references` }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("embed-bible error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
