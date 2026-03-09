import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive study notes for key Bible verses
// Based on Tyndale Open Study Notes themes (public domain commentary)
const STUDY_NOTES: { verse_reference: string; note_text: string }[] = [
  // GENESIS
  { verse_reference: "Genesis 1:1", note_text: "The opening declaration establishes God as Creator of all things. The Hebrew word 'bara' (create) is used exclusively for divine activity, emphasizing that creation is God's sovereign act. This verse answers the fundamental question of origins and establishes the foundation for all biblical theology." },
  { verse_reference: "Genesis 1:26", note_text: "The plural 'Let us make' has been understood as a reference to the Trinity, a divine council, or a plural of majesty. Humanity is uniquely created in God's image (imago Dei), which includes rationality, morality, relationality, and the capacity for spiritual communion with God." },
  { verse_reference: "Genesis 1:27", note_text: "Male and female are both created in God's image, establishing the equal dignity and worth of both genders. The image of God is not diminished by gender but expressed through the complementary relationship of male and female." },
  { verse_reference: "Genesis 3:15", note_text: "Known as the Protoevangelium (first gospel), this verse is the first messianic prophecy. The 'seed of the woman' who will crush the serpent's head is understood as pointing to Christ's ultimate victory over Satan at the cross." },
  { verse_reference: "Genesis 12:1", note_text: "God's call to Abram initiates the Abrahamic covenant, which becomes the foundation for God's redemptive plan. The call required radical faith—leaving family, homeland, and security for an unknown destination based solely on God's promise." },
  { verse_reference: "Genesis 15:6", note_text: "This verse is pivotal in Paul's theology of justification by faith (Romans 4, Galatians 3). Abraham's faith—trusting God's promise despite circumstances—was 'credited as righteousness,' establishing the pattern of salvation by grace through faith." },
  { verse_reference: "Genesis 22:8", note_text: "Abraham's prophetic statement 'God himself will provide the lamb' foreshadows both the immediate provision of the ram and the ultimate provision of Christ as the Lamb of God (John 1:29)." },
  // EXODUS
  { verse_reference: "Exodus 3:14", note_text: "God reveals His name as 'I AM WHO I AM' (YHWH), expressing self-existence, eternality, and covenant faithfulness. This name emphasizes God's unchanging nature and His active presence with His people. Jesus applies this name to Himself in John 8:58." },
  { verse_reference: "Exodus 12:13", note_text: "The Passover blood on the doorposts is a powerful type of Christ's atoning sacrifice. Just as the blood of the lamb protected Israel from judgment, Christ our Passover Lamb (1 Corinthians 5:7) shields believers from divine wrath." },
  { verse_reference: "Exodus 20:3", note_text: "The First Commandment establishes monotheism and exclusive devotion to YHWH as the foundation of covenant life. It addresses not just worship of false gods but anything that takes God's rightful place of supremacy in our hearts." },
  // PSALMS
  { verse_reference: "Psalm 1:1", note_text: "This wisdom psalm opens the Psalter by contrasting two ways of life. The progression from 'walking' to 'standing' to 'sitting' illustrates how sin gradually entangles. The blessed person actively avoids evil influences and instead delights in God's instruction." },
  { verse_reference: "Psalm 23:1", note_text: "David draws on his shepherd experience to portray God's care. The metaphor of shepherd implies intimate knowledge, protective guidance, and provision. 'I shall not want' expresses complete trust in God's sufficiency for every need." },
  { verse_reference: "Psalm 23:4", note_text: "The 'valley of the shadow of death' represents life's darkest moments. The shift from 'He' to 'You' indicates that in suffering, our relationship with God becomes more intimate and personal. God's presence transforms terror into comfort." },
  { verse_reference: "Psalm 34:18", note_text: "God's nearness to the brokenhearted reveals His compassionate character. He does not distance Himself from suffering but draws near to those in pain. This verse assures believers that grief and brokenness do not separate us from God's love." },
  { verse_reference: "Psalm 37:5", note_text: "To 'commit your way' literally means to 'roll' your burdens onto the Lord. This involves active trust—releasing control and anxiety to God's sovereign care. The promise 'He will act' assures that God responds to faith with faithful action." },
  { verse_reference: "Psalm 46:1", note_text: "Written possibly after a great military deliverance, this psalm declares God as our ultimate security. 'A very present help' means God is abundantly available in trouble—not distant or delayed. Martin Luther's hymn 'A Mighty Fortress' draws from this psalm." },
  { verse_reference: "Psalm 51:10", note_text: "David's prayer after his sin with Bathsheba reveals the depth of true repentance. 'Create' uses the same Hebrew word as Genesis 1:1, suggesting that only God's creative power can produce genuine inner transformation." },
  { verse_reference: "Psalm 62:1", note_text: "The Hebrew word translated 'silence' or 'rest' suggests a settled, confident waiting. This is not passive resignation but active trust—the soul deliberately choosing to find its security in God alone rather than in human solutions." },
  { verse_reference: "Psalm 91:1", note_text: "Four names for God appear in verses 1-2 (Most High, Almighty, LORD, my God), emphasizing the comprehensive nature of divine protection. 'Dwelling in the shelter' implies an ongoing, habitual communion with God, not occasional visits." },
  { verse_reference: "Psalm 119:105", note_text: "God's Word is described as both a lamp (for immediate steps) and a light (for the broader path). This dual image suggests Scripture provides both practical daily guidance and long-term directional wisdom for life's journey." },
  { verse_reference: "Psalm 139:14", note_text: "The psalmist responds to God's intimate knowledge with worship. 'Fearfully and wonderfully made' celebrates the intricate design of human life, affirming the inherent value and dignity of every person as God's masterwork." },
  // PROVERBS
  { verse_reference: "Proverbs 1:7", note_text: "This is the motto of the entire book of Proverbs. 'Fear of the LORD' is not terror but reverent awe—a proper recognition of God's holiness, power, and authority that serves as the foundation for all true knowledge and wisdom." },
  { verse_reference: "Proverbs 2:6", note_text: "Wisdom is not merely human achievement but a divine gift. God is both the source and the giver of wisdom, knowledge, and understanding. This verse encourages believers to seek wisdom through relationship with God rather than purely intellectual pursuit." },
  { verse_reference: "Proverbs 3:5", note_text: "This beloved verse presents a fundamental choice: trust God's wisdom or rely on human understanding. 'With all your heart' indicates wholehearted, undivided trust. The contrast is not between faith and reason, but between God-centered and self-centered thinking." },
  // ISAIAH
  { verse_reference: "Isaiah 6:3", note_text: "The seraphim's threefold 'Holy' (trisagion) emphasizes God's supreme holiness—His absolute moral purity and transcendent otherness. This vision profoundly humbled Isaiah and transformed his ministry. The heavenly worship scene shapes Christian liturgy and theology of worship." },
  { verse_reference: "Isaiah 7:14", note_text: "The prophecy of Immanuel ('God with us') has both immediate and messianic fulfillment. Matthew 1:23 identifies Jesus as the ultimate fulfillment. The virgin birth signifies the supernatural nature of the Messiah's entrance into human history." },
  { verse_reference: "Isaiah 40:31", note_text: "After declaring God's incomparable power (vv. 28-30), Isaiah promises supernatural renewal for those who 'wait' on the Lord. 'Wait' (qavah) means to bind together or entwine—suggesting intimate dependence on God that results in exchanged weakness for divine strength." },
  { verse_reference: "Isaiah 41:10", note_text: "Three commands ('fear not,' 'be not dismayed') are matched by three promises ('I am with you,' 'I will strengthen you,' 'I will help you'). The phrase 'my righteous right hand' symbolizes God's power, authority, and covenant faithfulness." },
  { verse_reference: "Isaiah 53:5", note_text: "This Suffering Servant passage is the most detailed messianic prophecy of Christ's atoning death. 'Wounded for our transgressions' establishes substitutionary atonement—the innocent suffering for the guilty. The New Testament identifies Jesus as this Suffering Servant." },
  { verse_reference: "Isaiah 55:11", note_text: "God's Word is described as an active agent that accomplishes His purposes with certainty. This assures believers that Scripture reading, preaching, and sharing God's Word is never futile—it always produces the results God intends." },
  // JEREMIAH
  { verse_reference: "Jeremiah 29:11", note_text: "Originally spoken to Jewish exiles in Babylon, this promise reveals God's redemptive purposes even in judgment. The 'plans for welfare' include restoration, hope, and a future. While specifically addressed to Israel, the principle of God's good purposes for His people applies broadly." },
  { verse_reference: "Jeremiah 31:33", note_text: "The New Covenant promise describes an internalization of God's law—written on hearts rather than stone tablets. This foreshadows the Holy Spirit's work in believers (2 Corinthians 3:3), enabling obedience from transformed hearts rather than external compulsion." },
  // MATTHEW
  { verse_reference: "Matthew 5:3", note_text: "The Beatitudes open Jesus' Sermon on the Mount with a radical reversal of worldly values. 'Poor in spirit' describes those who recognize their spiritual bankruptcy before God—the opposite of self-righteousness. The kingdom belongs to the humble, not the self-sufficient." },
  { verse_reference: "Matthew 6:33", note_text: "Jesus commands prioritizing God's kingdom and righteousness above material concerns. This is not a formula for prosperity but a call to reorder values. When God's purposes come first, He promises to provide what is truly needed." },
  { verse_reference: "Matthew 11:28", note_text: "Jesus' invitation addresses those exhausted by religious legalism and life's burdens. His 'rest' (anapausis) is not inactivity but relief from the crushing weight of trying to earn God's favor. The 'yoke' He offers is partnership with Him in grace." },
  { verse_reference: "Matthew 28:19", note_text: "The Great Commission establishes the church's mission: making disciples of all nations. The Trinitarian baptismal formula ('Father, Son, Holy Spirit') affirms the full deity of each Person. 'All nations' breaks through every ethnic and cultural boundary." },
  // JOHN
  { verse_reference: "John 1:1", note_text: "Echoing Genesis 1:1, John identifies Jesus as the eternal Word (Logos) who was with God and was God. This profound theological statement establishes Christ's pre-existence, distinct personhood within the Trinity, and full deity—the foundation of Christian Christology." },
  { verse_reference: "John 3:16", note_text: "Called 'the gospel in miniature,' this verse encapsulates God's love, Christ's mission, and salvation's offer. 'So loved' emphasizes the extraordinary nature of divine love. 'Whoever believes' makes salvation universally available. 'Shall not perish' assures eternal security." },
  { verse_reference: "John 14:6", note_text: "Jesus' exclusive claim to be 'the way, the truth, and the life' establishes Christianity's distinctive claim. He is not merely a teacher of truth but Truth incarnate, not just showing the way but being the Way, not just giving life but being Life itself." },
  { verse_reference: "John 15:5", note_text: "The vine and branches metaphor illustrates the believer's vital union with Christ. 'Apart from me you can do nothing' is an absolute statement about spiritual fruitfulness—genuine Christian living is impossible through human effort alone but requires moment-by-moment dependence on Christ." },
  // ROMANS
  { verse_reference: "Romans 3:23", note_text: "This verse establishes the universal need for salvation. 'All have sinned' eliminates any claim of human merit. 'Fall short of the glory of God' means humanity fails to reflect God's character as intended. This levels the playing field—every person needs God's grace equally." },
  { verse_reference: "Romans 5:3", note_text: "Paul presents a counterintuitive chain: suffering produces endurance, endurance produces character, character produces hope. This is not masochism but the recognition that God uses trials redemptively. The process transforms suffering from meaningless pain into purposeful growth." },
  { verse_reference: "Romans 5:8", note_text: "The supreme demonstration of God's love is its timing—'while we were still sinners.' God's love is not a response to our goodness but extends to us at our worst. This unconditional love is the foundation of Christian assurance and the model for our love toward others." },
  { verse_reference: "Romans 6:23", note_text: "This verse presents the starkest contrast in Scripture: wages earned (death) versus gift freely given (eternal life). Sin pays what we deserve; God gives what we don't deserve. The shift from 'wages' to 'gift' is the essence of grace." },
  { verse_reference: "Romans 8:1", note_text: "After the intense struggle of chapter 7, 'no condemnation' is a triumphant declaration. Those 'in Christ Jesus' are completely free from the penalty of sin. This is not merely reduced condemnation but its total removal—the legal verdict is permanent acquittal." },
  { verse_reference: "Romans 8:28", note_text: "This promise is not that all things are good, but that God works all things together for good. The 'good' is defined in verse 29 as conformity to Christ's image. This includes suffering, loss, and difficulty—nothing is wasted in God's redemptive economy." },
  { verse_reference: "Romans 8:38", note_text: "Paul's triumphant conclusion lists every conceivable threat—death, life, angels, rulers, present, future, powers, height, depth—and declares none can separate believers from God's love in Christ. This is the ultimate statement of eternal security and unbreakable divine love." },
  { verse_reference: "Romans 12:1", note_text: "Paul transitions from doctrine to practice with 'therefore.' Our entire lives become a living sacrifice—not dead rituals but dynamic, ongoing worship. 'Reasonable service' can also be translated 'spiritual worship,' connecting everyday life to sacred devotion." },
  // 1 CORINTHIANS
  { verse_reference: "1 Corinthians 10:13", note_text: "Three assurances about temptation: it is common (not unique to you), limited (God sets boundaries), and escapable (God always provides a way out). This verse balances divine sovereignty in controlling trials with human responsibility to use the 'way of escape.'" },
  { verse_reference: "1 Corinthians 13:4", note_text: "Paul's love chapter describes love not as emotion but as action and character. Each description is a verb, not an adjective—love is something you do, not just something you feel. This portrait of love perfectly describes Christ and challenges believers to Christ-like loving." },
  { verse_reference: "1 Corinthians 13:7", note_text: "Four 'alls' define love's resilience: bears all, believes all, hopes all, endures all. This doesn't mean naivety but an orientation toward the best in others, a refusal to give up on people, and a supernatural capacity to persist through difficulty." },
  { verse_reference: "1 Corinthians 15:55", note_text: "Paul's triumphant taunt of death draws on Hosea 13:14. Through Christ's resurrection, death has lost its ultimate power ('sting') and its permanent claim ('victory'). For believers, death becomes a defeated enemy—the doorway to eternal life rather than final destruction." },
  // 2 CORINTHIANS
  { verse_reference: "2 Corinthians 1:3", note_text: "Paul opens with a doxology rooted in suffering. The 'God of all comfort' uses Paul's afflictions to create a ministry of compassion. The comfort received from God overflows to others—creating a chain of consolation that transforms pain into purposeful ministry." },
  { verse_reference: "2 Corinthians 5:17", note_text: "Being 'in Christ' produces a radical transformation—a new creation. 'The old has gone' and 'the new has come' describe a fundamental change in identity, not merely behavior modification. This echoes Isaiah's new creation language and points to eschatological renewal." },
  { verse_reference: "2 Corinthians 12:9", note_text: "God's response to Paul's thorn reveals a paradoxical principle: divine power is perfected in human weakness. Rather than removing the suffering, God provides sufficient grace within it. This transforms our understanding of strength—true spiritual power flows through acknowledged weakness." },
  // GALATIANS
  { verse_reference: "Galatians 2:20", note_text: "Paul's statement of union with Christ is among the most profound in Scripture. Crucifixion with Christ means the old self-centered life has ended. The new life is lived by faith in Christ who loved us. This verse captures the essence of Christian identity transformation." },
  { verse_reference: "Galatians 5:22", note_text: "The singular 'fruit' (not 'fruits') indicates these nine qualities are an integrated whole, not a menu to choose from. They describe Christ's character reproduced in believers by the Spirit. This contrasts sharply with the 'works of the flesh' (vv. 19-21), which are self-generated." },
  // EPHESIANS
  { verse_reference: "Ephesians 2:8", note_text: "The threefold emphasis—'by grace,' 'through faith,' 'not of works'—eliminates all human contribution to salvation. Even faith itself is implied to be God's gift ('this' in 'this is not your own doing'). Salvation is entirely God's gracious initiative and provision." },
  { verse_reference: "Ephesians 6:11", note_text: "The 'whole armor of God' metaphor draws on Roman military equipment. Each piece represents a spiritual reality: truth, righteousness, gospel readiness, faith, salvation, and God's Word. The comprehensive nature ('whole armor') means no piece can be neglected without vulnerability." },
  { verse_reference: "Ephesians 6:12", note_text: "Paul reveals the true nature of spiritual conflict—not against human enemies but against supernatural evil powers. The hierarchical terms (rulers, authorities, cosmic powers, spiritual forces) suggest an organized kingdom of darkness that opposes God's purposes." },
  // PHILIPPIANS
  { verse_reference: "Philippians 1:6", note_text: "God's 'good work' began at conversion and will be completed at Christ's return. This provides assurance of perseverance—salvation is not dependent on human effort but on God's faithful commitment to finish what He started." },
  { verse_reference: "Philippians 4:6", note_text: "The antidote to anxiety is prayer characterized by three elements: petition (specific requests), supplication (earnest pleading), and thanksgiving (grateful acknowledgment). The command is comprehensive—'in everything'—and the result is supernatural peace (v. 7)." },
  { verse_reference: "Philippians 4:13", note_text: "In context, Paul speaks of contentment in all circumstances—abundance and need. 'I can do all things' is not a blank check for personal ambition but confidence that Christ enables believers to faithfully endure any situation God allows." },
  { verse_reference: "Philippians 4:19", note_text: "This promise follows the Philippians' generous giving (vv. 15-18). God's supply matches 'every need' (not every want) and flows from the inexhaustible resources of His glory. The promise connects generosity with God's faithful provision." },
  // COLOSSIANS
  { verse_reference: "Colossians 3:15", note_text: "Christ's peace is to 'rule' (literally 'umpire' or 'arbitrate') in believers' hearts, serving as an internal guide for decisions and relationships. This communal peace ('called in one body') emphasizes that individual peace contributes to corporate harmony." },
  // 1 THESSALONIANS
  { verse_reference: "1 Thessalonians 5:16", note_text: "The shortest verse in some translations, this command to 'rejoice always' is possible because Christian joy is rooted not in circumstances but in the unchanging relationship with God. Combined with the following commands (pray continually, give thanks), it outlines the rhythm of Spirit-filled living." },
  // 2 TIMOTHY
  { verse_reference: "2 Timothy 1:7", note_text: "Paul reminds Timothy that the Holy Spirit produces power (for ministry), love (for relationships), and self-discipline (for personal conduct). This counters the 'spirit of fear' or timidity that can paralyze believers. Spiritual courage is a gift to be activated, not a virtue to be manufactured." },
  { verse_reference: "2 Timothy 3:16", note_text: "The foundational verse on biblical inspiration. 'God-breathed' (theopneustos) means Scripture originates from God, not merely human authors. Its fourfold usefulness—teaching, reproof, correction, training in righteousness—covers both belief (what's true/false) and behavior (what's right/wrong)." },
  // HEBREWS
  { verse_reference: "Hebrews 4:12", note_text: "God's Word is described as living, active, and penetrating—not a dead text but a dynamic force that exposes the deepest realities of the human heart. The 'two-edged sword' imagery emphasizes its precision in dividing truth from falsehood and genuine faith from pretense." },
  { verse_reference: "Hebrews 11:1", note_text: "This is not a dictionary definition of faith but a description of faith's function. 'Assurance' (hypostasis) means substantial reality—faith gives present substance to future promises. 'Conviction' (elegchos) means proof or evidence—faith perceives invisible realities with certainty." },
  { verse_reference: "Hebrews 12:1", note_text: "The 'great cloud of witnesses' (chapter 11's faith heroes) serves as motivation, not spectators. 'Lay aside every weight' includes not just sin but anything that hinders. The Christian life is depicted as a long-distance race requiring endurance, focus, and the removal of encumbrances." },
  // JAMES
  { verse_reference: "James 1:2", note_text: "James' radical command to consider trials as 'pure joy' is based on their purpose: testing faith produces steadfastness (endurance). This does not minimize suffering but reframes it—trials are God's training ground for spiritual maturity and completeness." },
  { verse_reference: "James 1:5", note_text: "God's wisdom is available 'generously' and 'without reproach'—He gives freely without making us feel guilty for asking. The condition is asking 'in faith, without doubting,' which means settled confidence in God's character and willingness to give, not perfect certainty about outcomes." },
  { verse_reference: "James 2:17", note_text: "James' famous statement that 'faith without works is dead' does not contradict Paul's justification by faith. Rather, James addresses a different question: not how we are saved, but how genuine saving faith is demonstrated. True faith inevitably produces visible fruit." },
  // 1 PETER
  { verse_reference: "1 Peter 2:9", note_text: "Four titles describe the church's corporate identity: chosen race, royal priesthood, holy nation, people for God's possession. Each echoes Old Testament Israel's identity (Exodus 19:5-6) now applied to the multi-ethnic church. The purpose is to 'proclaim the excellencies' of God." },
  { verse_reference: "1 Peter 5:7", note_text: "The command to cast anxieties on God is grounded in His personal care—'He cares for you.' The Greek word for 'cast' implies a decisive, intentional action of transferring burdens to God. This is not passive resignation but active trust in a caring Father." },
  // 1 JOHN
  { verse_reference: "1 John 1:9", note_text: "God's response to confession is both just (He keeps His promise) and faithful (He maintains covenant relationship). 'Cleanse us from all unrighteousness' goes beyond forgiveness to purification—dealing not just with the guilt of sin but its contaminating effects." },
  { verse_reference: "1 John 4:4", note_text: "Assurance of victory over false spirits and worldly deception. 'Greater is He who is in you' refers to the indwelling Holy Spirit whose power exceeds all spiritual opposition. This is not triumphalism but confidence in God's superior power working within believers." },
  { verse_reference: "1 John 4:19", note_text: "God's love is the cause, not the result, of our love. 'We love because He first loved us' establishes that all genuine human love originates in and flows from God's prior, initiating love. This transforms love from duty to response." },
  // REVELATION
  { verse_reference: "Revelation 3:20", note_text: "Often used evangelistically, in context Jesus addresses the lukewarm church of Laodicea. He stands outside knocking—the church has shut Him out. The intimate meal fellowship He offers represents restored communion. The verse beautifully portrays Christ's patience and desire for relationship." },
  { verse_reference: "Revelation 21:4", note_text: "The ultimate promise of restoration: no more tears, death, mourning, crying, or pain. 'The former things have passed away' signals complete renewal. This is not escapism but the certain hope that grounds Christian perseverance through present suffering toward an unimaginably glorious future." },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sb = createClient(supabaseUrl, supabaseKey);

    // Check existing count
    const { count } = await sb.from("study_notes").select("*", { count: "exact", head: true });
    console.log(`Current study_notes count: ${count}`);

    // Upsert all study notes
    let totalInserted = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < STUDY_NOTES.length; i += BATCH_SIZE) {
      const batch = STUDY_NOTES.slice(i, i + BATCH_SIZE);
      const { error } = await sb.from("study_notes").upsert(batch, {
        onConflict: "verse_reference",
        ignoreDuplicates: false, // Update existing notes with better content
      });
      if (error) {
        console.error(`Error inserting batch ${i}:`, error);
      } else {
        totalInserted += batch.length;
      }
    }

    return new Response(JSON.stringify({
      message: `Upserted ${totalInserted} study notes`,
      total_notes: STUDY_NOTES.length,
      complete: true,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-study-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
