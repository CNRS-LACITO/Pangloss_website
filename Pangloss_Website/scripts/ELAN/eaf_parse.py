import sys
import pympi
import string
from lxml import etree

filename = sys.argv[1]
eafob = pympi.Elan.Eaf(filename)

#print(eafob.header)
#print(eafob.adocument)
#print(eafob.media_descriptors)
#print(eafob.timeslots)
# print(eafob.linguistic_types)
# for anno in eafob.annotations:
#     print("\n")
#     print(anno)
#     print(eafob.annotations[anno])
#     print(type(eafob.tiers[eafob.annotations[anno]]))

# for tier in eafob.tiers:
#     print(eafob.tiers[tier])

# print("\n\n\n")
# for name in eafob.get_tier_names():
#     print(name)
#     print(eafob.get_parameters_for_tier(name))
#     for dic in eafob.tiers[name]:
#         print(dic)



file = open(sys.argv[2],"wb")
notes = [v for k,v in eafob.tiers["Transcriber Notes"][0].items()]
sents = dict(eafob.tiers["Dzala Sentence"][0])
sent_Trans = dict(eafob.tiers["English Free Translation"][1])
chunks = dict(eafob.tiers["Dzala IU"][0])
words = dict(eafob.tiers["Dzala Words and Morphemes"][1])
word_Trans = dict(eafob.tiers["Gloss"][1])

root = etree.Element('TEXT', id = filename[:-4])
root.set("{http://www.w3.org/XML/1998/namespace}lang", "dzl")

head = etree.Element("HEADER")

title = etree.Element("TITLE")
title.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
title.text = filename[:-4]
head.append(title)

soundfile = etree.SubElement(head,"HEADER")
soundfile.set("href", eafob.media_descriptors[0]["RELATIVE_MEDIA_URL"])
head.append(soundfile)
root.append(head)

parser = etree.XMLParser(remove_blank_text=True)

for elem in sorted(sent_Trans.keys()):
    #TODO Note
    reference = sents[sent_Trans[elem][0]]
    translated_sentence = sent_Trans[elem][1]
    source_sentence = reference[2]
    #chunk IDs in the sentence
    chunks_in_sent = [k for k, v in chunks.items() if eafob.timeslots[v[0]] > eafob.timeslots[reference[0]] and eafob.timeslots[v[0]] < eafob.timeslots[reference[1]]]
    #(word ID, Word, Id of Previous word in chunk, Id of chunk)
    words_in_sent = [(k,v[1],v[2],v[0]) for k,v in words.items() if v[0] in chunks_in_sent]
    words_in_sent.sort(key = lambda x: x[3])
    words_in_sent.sort(key = lambda x: x[0])
    word_order = [x[0] for x in words_in_sent]
    trans_in_sent = [(v[0],v[1]) for k, v in word_Trans.items() if v[0] in word_order]
    trans_in_sent = sorted(trans_in_sent, key=lambda x: word_order.index(x[0]))
    notes_in_sent = [c for a,b,c,d in notes if eafob.timeslots[a] > eafob.timeslots[reference[0]] and eafob.timeslots[a] < eafob.timeslots[reference[1]]]

    sent = etree.Element('S', id = sent_Trans[elem][0])
    audio = etree.SubElement(sent, "AUDIO")
    audio.set("start",str(int(eafob.timeslots[reference[0]])*.001))
    audio.set("end",str(int(eafob.timeslots[reference[1]])*.001))

    form = etree.Element('FORM')
    form.text = source_sentence
    sent.append(form)

    transl = etree.Element('TRANSL')
    transl.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
    transl.text = translated_sentence
    sent.append(transl)

    for note in notes_in_sent:
        note_leaf = etree.SubElement(sent,"NOTE")
        note_leaf.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
        note_leaf.set("message", note)

    for word,tran in zip(words_in_sent,trans_in_sent):
        word_leaf = etree.Element('W')

        form_leaf = etree.Element('FORM')
        form_leaf.text = word[1]
        word_leaf.append(form_leaf)

        transl_leaf = etree.Element('TRANSL')
        transl_leaf.set("{http://www.w3.org/XML/1998/namespace}lang", "en")
        transl_leaf.text = tran[1]
        word_leaf.append(transl_leaf)
        sent.append(word_leaf)
    root.append(sent)


file.write(etree.tostring(root, encoding='UTF-8' ,pretty_print=True))


